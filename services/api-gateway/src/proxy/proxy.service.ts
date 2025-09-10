import { Injectable, Logger, BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ServiceDiscoveryService } from '../service-discovery/service-discovery.service';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface ProxyOptions {
  timeout?: number;
  retries?: number;
  preserveHost?: boolean;
  followRedirects?: boolean;
  bufferReqBody?: boolean;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly defaultTimeout = 30000; // 30 seconds
  private readonly defaultRetries = 2;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private serviceDiscovery: ServiceDiscoveryService,
    private circuitBreaker: CircuitBreakerService,
    private monitoring: MonitoringService,
  ) {}

  async proxyRequest(
    req: Request,
    res: Response,
    serviceName: string,
    targetPath?: string,
    options?: ProxyOptions
  ): Promise<void> {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;

    try {
      // Get service instance
      const serviceInstance = this.serviceDiscovery.getServiceInstance(serviceName);
      if (!serviceInstance) {
        throw new ServiceUnavailableException(`Service ${serviceName} is not available`);
      }

      // Build target URL
      const targetUrl = this.buildTargetUrl(serviceInstance.address, serviceInstance.port, targetPath || req.path);
      
      this.logger.debug(`Proxying ${req.method} ${req.originalUrl} to ${targetUrl}`);

      // Execute request with circuit breaker
      const response = await this.circuitBreaker.executeWithBreaker(
        `${serviceName}-${req.method}-${req.path}`,
        () => this.executeRequest(req, targetUrl, options),
        {
          timeout: options?.timeout || this.defaultTimeout,
          name: `${serviceName}-proxy`,
        }
      );

      // Forward response
      this.forwardResponse(response, res);

      // Record metrics
      const duration = Date.now() - startTime;
      this.monitoring.recordHttpRequest(
        req.method,
        req.route?.path || req.path,
        response.status,
        duration,
        serviceName
      );

      this.monitoring.logServiceCall(serviceName, req.method, targetUrl, duration, true, requestId);

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error
      this.monitoring.logError(error, {
        serviceName,
        method: req.method,
        path: req.path,
        requestId,
      });

      this.monitoring.logServiceCall(serviceName, req.method, targetPath || req.path, duration, false, requestId);

      // Handle different error types
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
        throw new ServiceUnavailableException(`Service ${serviceName} is unavailable`);
      } else if (error.response?.status >= 400) {
        // Forward service error response
        res.status(error.response.status).json(error.response.data);
      } else {
        throw new BadGatewayException(`Failed to proxy request to ${serviceName}: ${error.message}`);
      }
    }
  }

  private async executeRequest(req: Request, targetUrl: string, options?: ProxyOptions) {
    const config = {
      method: req.method as any,
      url: targetUrl,
      headers: this.prepareHeaders(req),
      data: req.body,
      timeout: options?.timeout || this.defaultTimeout,
      maxRedirects: options?.followRedirects ? 5 : 0,
      validateStatus: () => true, // Don't throw on HTTP error status codes
    };

    // Remove content-length header to let axios handle it
    delete config.headers['content-length'];

    let lastError: Error;
    const maxRetries = options?.retries ?? this.defaultRetries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await firstValueFrom(this.httpService.request(config));
        return response;
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries && this.shouldRetry(error)) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await this.sleep(delay);
          continue;
        }
        
        break;
      }
    }

    throw lastError;
  }

  private buildTargetUrl(address: string, port: number, path: string): string {
    // Remove API version prefix from path if present
    const cleanPath = path.replace(/^\/api\/v\d+/, '');
    
    // Ensure path starts with /
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    return `http://${address}:${port}${finalPath}`;
  }

  private prepareHeaders(req: Request): Record<string, string> {
    const headers = { ...req.headers };
    
    // Remove hop-by-hop headers
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'transfer-encoding',
      'upgrade',
    ];

    hopByHopHeaders.forEach(header => delete headers[header]);

    // Add forwarded headers
    headers['x-forwarded-for'] = req.ip;
    headers['x-forwarded-proto'] = req.protocol;
    headers['x-forwarded-host'] = req.get('host') || '';
    
    // Ensure content-type is set for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    return headers as Record<string, string>;
  }

  private forwardResponse(axiosResponse: any, res: Response): void {
    // Set status code
    res.status(axiosResponse.status);

    // Forward headers (excluding hop-by-hop headers)
    const responseHeaders = { ...axiosResponse.headers };
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'transfer-encoding',
      'upgrade',
      'content-encoding', // Let Express handle compression
    ];

    hopByHopHeaders.forEach(header => delete responseHeaders[header]);

    Object.entries(responseHeaders).forEach(([key, value]) => {
      if (value) {
        res.setHeader(key, value as string);
      }
    });

    // Send response body
    if (axiosResponse.data) {
      res.send(axiosResponse.data);
    } else {
      res.end();
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx status codes
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    if (error.response?.status >= 500 && error.response?.status < 600) {
      return true;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check for proxy service
  async healthCheck(): Promise<{ status: string; services: any }> {
    const services = this.configService.get('services');
    const serviceHealth: any = {};

    for (const serviceName of Object.keys(services)) {
      const instance = this.serviceDiscovery.getServiceInstance(serviceName);
      serviceHealth[serviceName] = {
        available: !!instance,
        healthy: instance?.healthy || false,
        address: instance?.address,
        port: instance?.port,
      };
    }

    return {
      status: 'healthy',
      services: serviceHealth,
    };
  }
}