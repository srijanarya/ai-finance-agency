import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKeyHeader: string;
  private readonly validApiKeys: Set<string>;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.apiKeyHeader = this.configService.get<string>('apiKey.header');
    
    // In production, load from secure storage or environment
    const apiKeySecret = this.configService.get<string>('apiKey.secret');
    this.validApiKeys = new Set([
      apiKeySecret,
      // Add more API keys as needed
    ]);
  }

  canActivate(context: ExecutionContext): boolean {
    const requiresApiKey = this.reflector.getAllAndOverride<boolean>('requiresApiKey', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiresApiKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers[this.apiKeyHeader.toLowerCase()];

    if (!apiKey || !this.validApiKeys.has(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}