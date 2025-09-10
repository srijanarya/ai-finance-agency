import { Injectable } from '@nestjs/common';

export interface ServiceDependency {
  name: string;
  url: string;
  critical: boolean;
  timeout?: number;
}

@Injectable()
export class HealthService {
  private readonly serviceDependencies: Record<string, ServiceDependency[]> = {
    'api-gateway': [
      { name: 'user-management', url: 'http://user-management:3001/health', critical: true },
      { name: 'trading', url: 'http://trading:3002/health', critical: true },
      { name: 'signals', url: 'http://signals:3003/health', critical: true },
      { name: 'payment', url: 'http://payment:3004/health', critical: true },
      { name: 'education', url: 'http://education:3005/health', critical: false },
    ],
    'user-management': [
      { name: 'payment', url: 'http://payment:3004/health', critical: false },
    ],
    'trading': [
      { name: 'user-management', url: 'http://user-management:3001/health', critical: true },
      { name: 'signals', url: 'http://signals:3003/health', critical: false },
    ],
    'signals': [
      { name: 'user-management', url: 'http://user-management:3001/health', critical: true },
      { name: 'trading', url: 'http://trading:3002/health', critical: false },
    ],
    'payment': [
      { name: 'user-management', url: 'http://user-management:3001/health', critical: true },
    ],
    'education': [
      { name: 'user-management', url: 'http://user-management:3001/health', critical: true },
    ],
  };

  getDependencies(serviceName: string): ServiceDependency[] {
    return this.serviceDependencies[serviceName] || [];
  }

  getCriticalDependencies(serviceName: string): ServiceDependency[] {
    return this.getDependencies(serviceName).filter(dep => dep.critical);
  }

  getNonCriticalDependencies(serviceName: string): ServiceDependency[] {
    return this.getDependencies(serviceName).filter(dep => !dep.critical);
  }

  addDependency(serviceName: string, dependency: ServiceDependency): void {
    if (!this.serviceDependencies[serviceName]) {
      this.serviceDependencies[serviceName] = [];
    }
    this.serviceDependencies[serviceName].push(dependency);
  }

  removeDependency(serviceName: string, dependencyName: string): void {
    if (this.serviceDependencies[serviceName]) {
      this.serviceDependencies[serviceName] = this.serviceDependencies[serviceName]
        .filter(dep => dep.name !== dependencyName);
    }
  }

  getAllServices(): string[] {
    return Object.keys(this.serviceDependencies);
  }
}