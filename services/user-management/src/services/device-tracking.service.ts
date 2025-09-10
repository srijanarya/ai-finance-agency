import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../entities/user-session.entity';
import { AuditService } from './audit.service';
import { AuditAction } from '../entities/audit-log.entity';
import * as geoip from 'geoip-lite';
import * as UAParser from 'ua-parser-js';

export interface DeviceFingerprint {
  userAgent: string;
  ipAddress: string;
  timezone: string;
  language: string;
  screenResolution: string;
  platform: string;
  browserInfo: {
    name: string;
    version: string;
    engine: string;
  };
  osInfo: {
    name: string;
    version: string;
  };
  location: {
    country: string;
    region: string;
    city: string;
  };
  riskScore: number;
}

export interface SuspiciousActivityAlert {
  userId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: Record<string, any>;
  ipAddress?: string;
  deviceId?: string;
}

@Injectable()
export class DeviceTrackingService {
  private readonly HIGH_RISK_COUNTRIES = ['CN', 'RU', 'IR', 'KP', 'SY'];
  private readonly VPN_INDICATORS = ['VPN', 'PROXY', 'TOR'];
  private readonly SUSPICIOUS_USER_AGENTS = [
    'bot', 'crawler', 'spider', 'scan', 'headless', 'phantom',
  ];

  constructor(
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private auditService: AuditService,
  ) {}

  async analyzeDeviceFingerprint(
    userAgent: string,
    ipAddress: string,
    additionalData: Record<string, any> = {},
  ): Promise<DeviceFingerprint> {
    const parser = new UAParser(userAgent);
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();

    // Get geolocation data
    const geo = geoip.lookup(ipAddress) || {};
    const location = {
      country: geo.country || 'Unknown',
      region: geo.region || 'Unknown',
      city: geo.city || 'Unknown',
    };

    const fingerprint: DeviceFingerprint = {
      userAgent,
      ipAddress,
      timezone: additionalData.timezone || 'UTC',
      language: additionalData.language || 'en',
      screenResolution: additionalData.screenResolution || 'Unknown',
      platform: deviceInfo.type || osInfo.name || 'Unknown',
      browserInfo: {
        name: browserInfo.name || 'Unknown',
        version: browserInfo.version || 'Unknown',
        engine: parser.getEngine().name || 'Unknown',
      },
      osInfo: {
        name: osInfo.name || 'Unknown',
        version: osInfo.version || 'Unknown',
      },
      location,
      riskScore: this.calculateRiskScore(userAgent, ipAddress, location, geo),
    };

    return fingerprint;
  }

  private calculateRiskScore(
    userAgent: string,
    ipAddress: string,
    location: any,
    geoData: any,
  ): number {
    let riskScore = 0;

    // Check for high-risk countries
    if (this.HIGH_RISK_COUNTRIES.includes(location.country)) {
      riskScore += 30;
    }

    // Check for VPN/Proxy indicators
    if (this.VPN_INDICATORS.some(indicator => 
        userAgent.toLowerCase().includes(indicator.toLowerCase()))) {
      riskScore += 25;
    }

    // Check for suspicious user agents
    if (this.SUSPICIOUS_USER_AGENTS.some(suspicious => 
        userAgent.toLowerCase().includes(suspicious))) {
      riskScore += 40;
    }

    // Check for private IP addresses (potential proxy)
    if (this.isPrivateIP(ipAddress)) {
      riskScore += 20;
    }

    // Check if IP is from known hosting provider (potential bot)
    if (geoData && geoData.org && this.isHostingProvider(geoData.org)) {
      riskScore += 15;
    }

    // Check for unusual user agent length (too short or too long)
    if (userAgent.length < 50 || userAgent.length > 500) {
      riskScore += 10;
    }

    // Check for missing common browser headers
    if (!userAgent.includes('Mozilla') || !userAgent.includes('AppleWebKit')) {
      riskScore += 15;
    }

    return Math.min(100, riskScore); // Cap at 100
  }

  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^127\./,
    ];
    return privateRanges.some(range => range.test(ip));
  }

  private isHostingProvider(org: string): boolean {
    const hostingKeywords = [
      'amazon', 'google', 'microsoft', 'digitalocean', 'linode',
      'vultr', 'aws', 'azure', 'cloud', 'hosting', 'server',
    ];
    const orgLower = org.toLowerCase();
    return hostingKeywords.some(keyword => orgLower.includes(keyword));
  }

  async detectSuspiciousActivity(
    userId: string,
    currentFingerprint: DeviceFingerprint,
    sessionId?: string,
  ): Promise<SuspiciousActivityAlert[]> {
    const alerts: SuspiciousActivityAlert[] = [];

    // Get recent sessions for comparison
    const recentSessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Check for high-risk fingerprint
    if (currentFingerprint.riskScore >= 70) {
      alerts.push({
        userId,
        alertType: 'HIGH_RISK_DEVICE',
        severity: 'critical',
        description: `High-risk device detected (score: ${currentFingerprint.riskScore})`,
        evidence: { fingerprint: currentFingerprint },
        ipAddress: currentFingerprint.ipAddress,
        deviceId: sessionId,
      });
    }

    // Check for location anomalies
    const uniqueCountries = new Set(
      recentSessions.map(session => this.getCountryFromIP(session.ipAddress || ''))
    );
    
    if (uniqueCountries.size > 3) {
      alerts.push({
        userId,
        alertType: 'MULTIPLE_COUNTRIES',
        severity: 'high',
        description: `Login attempts from ${uniqueCountries.size} different countries`,
        evidence: { countries: Array.from(uniqueCountries) },
        ipAddress: currentFingerprint.ipAddress,
      });
    }

    // Check for rapid location changes (impossible travel)
    if (recentSessions.length > 1) {
      const lastSession = recentSessions[0];
      const lastLocation = this.getLocationFromIP(lastSession.ipAddress || '');
      const currentLocation = currentFingerprint.location;
      
      const timeDiff = Date.now() - lastSession.createdAt.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 6 && lastLocation.country !== currentLocation.country) {
        alerts.push({
          userId,
          alertType: 'IMPOSSIBLE_TRAVEL',
          severity: 'high',
          description: `Location change too rapid: ${lastLocation.country} to ${currentLocation.country} in ${Math.round(hoursDiff)} hours`,
          evidence: { 
            previousLocation: lastLocation, 
            currentLocation: currentLocation,
            timeDifference: hoursDiff 
          },
          ipAddress: currentFingerprint.ipAddress,
        });
      }
    }

    // Check for concurrent sessions from different locations
    const activeSessions = recentSessions.filter(session => session.isActive);
    const activeLocations = activeSessions.map(session => 
      this.getCountryFromIP(session.ipAddress || ''))
      .filter((country, index, arr) => arr.indexOf(country) === index);
    
    if (activeLocations.length > 2) {
      alerts.push({
        userId,
        alertType: 'CONCURRENT_LOCATIONS',
        severity: 'medium',
        description: `Active sessions from ${activeLocations.length} different locations`,
        evidence: { locations: activeLocations },
        ipAddress: currentFingerprint.ipAddress,
      });
    }

    // Log alerts
    for (const alert of alerts) {
      await this.auditService.log({
        userId,
        action: AuditAction.SUSPICIOUS_ACTIVITY,
        resource: 'security',
        level: alert.severity === 'critical' ? 'critical' : 'high',
        description: alert.description,
        details: alert.evidence,
        ipAddress: alert.ipAddress,
        sessionId,
      });
    }

    return alerts;
  }

  private getCountryFromIP(ipAddress: string): string {
    const geo = geoip.lookup(ipAddress);
    return geo?.country || 'Unknown';
  }

  private getLocationFromIP(ipAddress: string): any {
    const geo = geoip.lookup(ipAddress);
    return {
      country: geo?.country || 'Unknown',
      region: geo?.region || 'Unknown',
      city: geo?.city || 'Unknown',
    };
  }

  async isDeviceTrusted(
    userId: string,
    fingerprint: DeviceFingerprint,
  ): Promise<boolean> {
    // A device is trusted if:
    // 1. Low risk score
    // 2. Has been used successfully before
    // 3. No recent suspicious activity

    if (fingerprint.riskScore >= 50) {
      return false;
    }

    const trustedSessions = await this.sessionRepository.count({
      where: {
        userId,
        ipAddress: fingerprint.ipAddress,
        userAgent: fingerprint.userAgent,
        isActive: false, // Previously completed sessions
      },
    });

    return trustedSessions >= 3; // Require at least 3 successful sessions
  }

  async getFingerprintVariations(fingerprint: DeviceFingerprint): Promise<string[]> {
    const variations: string[] = [];
    
    // Create variations based on minor changes that could be legitimate
    const baseFingerprint = JSON.stringify({
      browser: fingerprint.browserInfo.name,
      os: fingerprint.osInfo.name,
      location: fingerprint.location.country,
    });
    
    variations.push(baseFingerprint);
    
    // Add variations with minor version differences
    variations.push(JSON.stringify({
      browser: fingerprint.browserInfo.name,
      os: fingerprint.osInfo.name,
      location: fingerprint.location.country,
      version: 'flexible',
    }));

    return variations;
  }

  async updateDeviceRiskScore(
    sessionId: string,
    additionalRisk: number,
    reason: string,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (session) {
      const currentRisk = session.riskScore || 0;
      const newRiskScore = Math.min(100, currentRisk + additionalRisk);

      await this.sessionRepository.update(sessionId, {
        riskScore: newRiskScore,
      });

      if (newRiskScore >= 80) {
        await this.auditService.log({
          userId: session.userId,
          action: AuditAction.SECURITY_ALERT,
          resource: 'session',
          resourceId: sessionId,
          level: 'critical',
          description: `Device risk score increased to ${newRiskScore}: ${reason}`,
          details: { previousRisk: currentRisk, newRisk: newRiskScore, reason },
        });
      }
    }
  }
}