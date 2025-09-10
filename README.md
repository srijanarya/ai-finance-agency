# TREUM ALGOTECH Platform

## 🎯 Overview

TREUM ALGOTECH is a comprehensive fintech platform targeting ₹600 Cr annual revenue by providing:

- **AI-Powered Trading Education** (₹24K to ₹8L courses)
- **Real-Time Trading Signals** (Subscription-based)
- **Crypto Trading Integration** (Multi-exchange support)
- **Broker Referral System** (Revenue sharing model)

## 🏗️ Architecture

This is a monorepo built with:

- **Turborepo** for monorepo management
- **Next.js 15.5.2** for web applications
- **React Native 0.75.4** for mobile apps
- **NestJS 10.4.5** for microservices
- **Node.js 22.11.0** LTS runtime

## 📁 Project Structure

```
treum-algotech/
├── apps/
│   ├── web/                     # Next.js web application
│   ├── mobile/                  # React Native mobile app
│   └── admin/                   # Admin dashboard
├── services/
│   ├── user-management/         # Authentication & KYC
│   ├── education/               # Course management
│   ├── signals/                 # Trading signals
│   ├── payment/                 # Payment processing
│   └── trading/                 # Exchange integration
├── packages/
│   ├── ui/                      # Shared UI components
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Shared utilities
│   └── config/                  # Shared configurations
├── infrastructure/
│   ├── docker/                  # Docker configurations
│   ├── kubernetes/              # K8s manifests
│   └── terraform/               # Infrastructure as code
└── docs/                        # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22.11.0 (LTS)
- npm >= 10.0.0
- Docker Desktop
- PostgreSQL 17.6
- Redis 7.4.1

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/treum-algotech/platform.git
   cd platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start databases**
   ```bash
   npm run docker:up
   ```

5. **Run migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

## 📝 Available Scripts

### Development
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all packages and applications
- `npm run test` - Run all tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint all code
- `npm run typecheck` - Type check all TypeScript

### Database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data
- `npm run db:reset` - Reset database (migrate + seed)

### Docker
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

### Code Quality
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🏛️ Technology Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.1** - UI library
- **TypeScript 5.6.3** - Type safety
- **Tailwind CSS 3.4.15** - Styling
- **Radix UI 1.1.0** - Headless components

### Backend
- **NestJS 10.4.5** - Node.js framework
- **Express.js 4.21.1** - HTTP server
- **PostgreSQL 17.6** - Primary database
- **Redis 7.4.1** - Caching and sessions
- **MongoDB 8.0.1** - Content storage

### Infrastructure
- **Docker 27.3.1** - Containerization
- **Kubernetes 1.31.2** - Orchestration
- **Kong** - API Gateway
- **Prometheus & Grafana** - Monitoring

## 🔐 Security

- **JWT** with RS256 signing
- **Multi-Factor Authentication** (TOTP)
- **KYC Verification** per Indian regulations
- **PCI DSS** compliance for payments
- **End-to-end encryption** for sensitive data

## 📊 Development Workflow

### Git Workflow
1. Create feature branch: `git checkout -b feature/epic-001-authentication`
2. Make changes with conventional commits
3. Run tests: `npm run test`
4. Create pull request
5. Code review and merge

### Conventional Commits
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 🧪 Testing

### Test Structure
- **Unit Tests**: Jest for business logic
- **Integration Tests**: Supertest for API endpoints
- **E2E Tests**: Playwright for user journeys
- **Performance Tests**: k6 for load testing

### Coverage Requirements
- Unit tests: >90% coverage
- Integration tests: Critical paths covered
- E2E tests: User journeys covered

## 📚 Documentation

- **Architecture**: `/docs/architecture/`
- **API Docs**: Auto-generated Swagger UI
- **User Stories**: `/docs/stories/`
- **Development Guide**: This README

## 🚀 Deployment

### Environments
- **Development**: Local Docker Compose
- **Staging**: Kubernetes cluster
- **Production**: Multi-region Kubernetes

### CI/CD Pipeline
- **GitHub Actions** for automated testing
- **ArgoCD** for GitOps deployment
- **Automated rollbacks** on failure

## 📈 Performance Targets

- **Page Load Time**: <2 seconds
- **API Response**: <200ms (p99)
- **Signal Delivery**: <100ms
- **Concurrent Users**: 1M+
- **Uptime**: 99.9%

## 🤝 Contributing

1. Read the [Contributing Guide](CONTRIBUTING.md)
2. Follow the [Code of Conduct](CODE_OF_CONDUCT.md)
3. Check the [Development Setup](#quick-start)
4. Submit pull requests with tests

## 📞 Support

- **Documentation**: [docs.treum.com](https://docs.treum.com)
- **Issues**: GitHub Issues
- **Security**: security@treum.com
- **General**: support@treum.com

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ by the TREUM ALGOTECH Team**