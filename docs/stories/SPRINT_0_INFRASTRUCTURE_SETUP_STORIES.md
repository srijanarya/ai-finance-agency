# Sprint 0: Infrastructure Setup Stories
## Foundation Sprint - Must Complete Before Development

---

## Story 0.1: Initialize Project Repository and Monorepo Structure
**Priority**: P0 - CRITICAL  
**Points**: 5  
**Dependencies**: None  
**Assignee**: DevOps Agent

### User Story
AS A development team  
I WANT a properly structured monorepo  
SO THAT all microservices and applications can be developed consistently

### Acceptance Criteria
- [ ] Git repository initialized with proper .gitignore
- [ ] Monorepo structure created using Turborepo
- [ ] Root package.json with exact versions from tech-stack.md
- [ ] Workspace configuration for apps/, services/, packages/
- [ ] ESLint and Prettier configurations in packages/config
- [ ] TypeScript base configuration with strict mode
- [ ] Husky pre-commit hooks for code quality
- [ ] Conventional commits enforced
- [ ] README.md with setup instructions

### Technical Tasks
1. Run `git init` and configure branch protection
2. Install Turborepo globally: `npm install -g turbo@2.1.3`
3. Create folder structure:
   ```
   treum-algotech/
   ├── apps/
   │   ├── web/         # Next.js 15.5.2
   │   ├── mobile/      # React Native 0.75.4
   │   └── admin/       # Admin dashboard
   ├── services/
   │   ├── user-management/
   │   ├── education/
   │   ├── signals/
   │   ├── payment/
   │   └── trading/
   ├── packages/
   │   ├── ui/          # Shared UI components
   │   ├── types/       # TypeScript types
   │   ├── utils/       # Shared utilities
   │   └── config/      # Shared configs
   ├── infrastructure/
   │   ├── docker/
   │   ├── kubernetes/
   │   └── terraform/
   └── docs/
   ```
4. Create root package.json with workspaces
5. Set up git hooks with Husky

### Definition of Done
- [ ] Repository accessible to all team members
- [ ] CI/CD can detect and build all workspaces
- [ ] `turbo run build` successfully builds all packages
- [ ] Documentation updated with setup instructions

---

## Story 0.2: Database Setup and Schema Creation
**Priority**: P0 - CRITICAL  
**Points**: 8  
**Dependencies**: Story 0.1  
**Assignee**: Database Agent

### User Story
AS A backend developer  
I WANT databases properly configured with schemas  
SO THAT I can start implementing data persistence

### Acceptance Criteria
- [ ] PostgreSQL 17.6 installed and configured
- [ ] MongoDB 8.0.1 installed and configured  
- [ ] Redis 7.4.1 installed and configured
- [ ] InfluxDB 2.7.10 installed for time-series data
- [ ] All schemas from architecture document created
- [ ] Database migrations set up with Prisma
- [ ] Connection pooling configured
- [ ] Database users and permissions set
- [ ] Seed data strategy documented and implemented

### Technical Tasks
1. Create docker-compose.yml for local databases:
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:17.6
       environment:
         POSTGRES_DB: treum_main
         POSTGRES_USER: treum_admin
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
     
     mongodb:
       image: mongo:8.0.1
       environment:
         MONGO_INITDB_ROOT_USERNAME: admin
         MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
       volumes:
         - mongo_data:/data/db
       ports:
         - "27017:27017"
     
     redis:
       image: redis:7.4.1-alpine
       command: redis-server --requirepass ${REDIS_PASSWORD}
       volumes:
         - redis_data:/data
       ports:
         - "6379:6379"
   ```

2. Create Prisma schemas for each service
3. Generate and run initial migrations
4. Create seed data scripts:
   - Test users with different KYC states
   - Sample courses and content
   - Mock trading signals
   - Test payment records

### Definition of Done
- [ ] All databases accessible via connection strings
- [ ] Schemas match architecture documentation
- [ ] Migrations can be run successfully
- [ ] Seed data loads without errors
- [ ] Database backup strategy documented

---

## Story 0.3: API Framework and Gateway Setup
**Priority**: P0 - CRITICAL  
**Points**: 8  
**Dependencies**: Story 0.1  
**Assignee**: Backend Agent

### User Story
AS A backend developer  
I WANT API frameworks and gateway configured  
SO THAT I can build endpoints with proper routing and security

### Acceptance Criteria
- [ ] NestJS 10.4.5 scaffolding for each microservice
- [ ] Express.js 4.21.1 as underlying framework
- [ ] Kong API Gateway configured
- [ ] GraphQL server setup with Apollo Server 4.11.0
- [ ] OpenAPI documentation configured
- [ ] CORS, rate limiting, and security middleware
- [ ] JWT authentication scaffolding
- [ ] Health check endpoints for all services
- [ ] Service discovery mechanism

### Technical Tasks
1. Install NestJS CLI: `npm i -g @nestjs/cli@10.4.5`
2. Scaffold each microservice:
   ```bash
   nest new user-management
   nest new education
   nest new signals
   nest new payment
   nest new trading
   ```
3. Set up Kong Gateway configuration
4. Create shared authentication module
5. Configure Swagger for API documentation
6. Set up service mesh with Istio

### Definition of Done
- [ ] All services respond to health checks
- [ ] API Gateway routes to all services
- [ ] Swagger UI accessible at /api/docs
- [ ] Authentication flow works end-to-end
- [ ] Rate limiting verified

---

## Story 0.4: External API Integration Setup
**Priority**: P0 - CRITICAL  
**Points**: 5  
**Dependencies**: Story 0.3  
**Assignee**: Integration Agent

### User Story
AS A developer  
I WANT external APIs configured with fallbacks  
SO THAT integrations are reliable and testable

### Acceptance Criteria
- [ ] Environment variables for all API keys
- [ ] API client wrappers created for:
  - OpenAI GPT-4
  - Anthropic Claude
  - Razorpay, PayU, Stripe
  - Exchange APIs (Binance, WazirX)
  - Market data APIs
- [ ] Circuit breaker pattern implemented
- [ ] Retry logic with exponential backoff
- [ ] Mock services for development/testing
- [ ] API rate limit tracking
- [ ] Fallback strategies documented

### Technical Tasks
1. Create .env.example with all required keys:
   ```env
   # AI Services
   OPENAI_API_KEY=
   ANTHROPIC_API_KEY=
   
   # Payment Gateways
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   PAYU_MERCHANT_KEY=
   STRIPE_SECRET_KEY=
   
   # Exchange APIs
   BINANCE_API_KEY=
   BINANCE_SECRET_KEY=
   WAZIRX_API_KEY=
   
   # Market Data
   ALPHA_VANTAGE_KEY=
   ```

2. Create API client factory:
   ```typescript
   // packages/integrations/src/api-client-factory.ts
   export class APIClientFactory {
     createOpenAIClient(config: OpenAIConfig): OpenAIClient
     createPaymentClient(provider: PaymentProvider): PaymentClient
     createExchangeClient(exchange: Exchange): ExchangeClient
   }
   ```

3. Implement circuit breaker with Opossum
4. Create mock servers using MSW (Mock Service Worker)

### Definition of Done
- [ ] All API keys securely stored in Vault/AWS Secrets
- [ ] Mock services return realistic data
- [ ] Circuit breakers trigger on failures
- [ ] Fallback mechanisms tested
- [ ] Integration tests pass with mocks

---

## Story 0.5: Testing Infrastructure Setup
**Priority**: P0 - CRITICAL  
**Points**: 5  
**Dependencies**: Stories 0.1, 0.2, 0.3  
**Assignee**: QA Agent

### User Story
AS A developer  
I WANT testing frameworks configured  
SO THAT I can write tests before implementation (TDD)

### Acceptance Criteria
- [ ] Jest 29.7.0 configured for unit tests
- [ ] Vitest 2.1.3 for frontend testing
- [ ] Playwright 1.48.0 for E2E tests
- [ ] Cypress 13.15.0 as alternative E2E
- [ ] Test databases configured
- [ ] Code coverage reporting setup
- [ ] CI/CD integration for tests
- [ ] Performance testing with k6
- [ ] Security testing with OWASP ZAP

### Technical Tasks
1. Configure Jest for each service:
   ```json
   {
     "jest": {
       "preset": "ts-jest",
       "testEnvironment": "node",
       "coverageThreshold": {
         "global": {
           "branches": 90,
           "functions": 90,
           "lines": 90,
           "statements": 90
         }
       }
     }
   }
   ```

2. Set up test databases with Docker
3. Create test data factories
4. Configure GitHub Actions for CI:
   ```yaml
   name: Test
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '22.11.0'
         - run: npm ci
         - run: npm test
         - run: npm run test:e2e
   ```

### Definition of Done
- [ ] All test commands work: `npm test`, `npm run test:e2e`
- [ ] Coverage reports generated
- [ ] CI/CD runs tests on every commit
- [ ] Test databases reset between runs
- [ ] Performance baseline established

---

## Story 0.6: Development Environment Configuration
**Priority**: P0 - CRITICAL  
**Points**: 3  
**Dependencies**: Stories 0.1-0.5  
**Assignee**: DevOps Agent

### User Story
AS A developer  
I WANT a consistent development environment  
SO THAT "it works on my machine" never happens

### Acceptance Criteria
- [ ] Docker Compose for complete local stack
- [ ] Environment variable management
- [ ] VS Code workspace settings
- [ ] Debugging configurations
- [ ] Hot reload working for all services
- [ ] Postman/Insomnia collections
- [ ] Database GUI tools configured
- [ ] Log aggregation setup

### Technical Tasks
1. Create docker-compose.dev.yml for full stack
2. Create .vscode/launch.json for debugging:
   ```json
   {
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug User Service",
         "runtimeExecutable": "npm",
         "runtimeArgs": ["run", "start:debug"],
         "cwd": "${workspaceFolder}/services/user-management",
         "port": 9229
       }
     ]
   }
   ```

3. Set up Portainer for Docker management
4. Configure Adminer for database access
5. Set up development SSL certificates

### Definition of Done
- [ ] `docker-compose up` starts entire stack
- [ ] All services accessible with hot reload
- [ ] Debugging works in VS Code
- [ ] Database tools accessible
- [ ] API collections importable
- [ ] Logs visible in centralized location

---

## Story 0.7: CI/CD Pipeline Foundation
**Priority**: P1 - HIGH  
**Points**: 5  
**Dependencies**: Story 0.1  
**Assignee**: DevOps Agent

### User Story
AS A team  
I WANT automated CI/CD pipelines  
SO THAT deployments are consistent and reliable

### Acceptance Criteria
- [ ] GitHub Actions workflows created
- [ ] Build pipeline for all services
- [ ] Automated testing in pipeline
- [ ] Docker image building and registry push
- [ ] Kubernetes manifests validated
- [ ] Environment-specific deployments
- [ ] Rollback capability
- [ ] Notifications on failures

### Technical Tasks
1. Create .github/workflows/ci.yml
2. Set up Docker Hub or ECR for images
3. Create Kubernetes deployment manifests
4. Set up ArgoCD for GitOps
5. Configure Slack notifications

### Definition of Done
- [ ] Commits trigger automated builds
- [ ] Failed tests block deployments
- [ ] Images pushed to registry
- [ ] Staging deployments automatic
- [ ] Production deployments manual approval
- [ ] Rollback tested successfully

---

## Story 0.8: Monitoring and Observability Setup
**Priority**: P1 - HIGH  
**Points**: 5  
**Dependencies**: Stories 0.3, 0.7  
**Assignee**: SRE Agent

### User Story
AS A team  
I WANT monitoring and observability  
SO THAT we can detect and debug issues quickly

### Acceptance Criteria
- [ ] Prometheus 2.55.0 collecting metrics
- [ ] Grafana 11.3.0 dashboards created
- [ ] Jaeger 1.62.0 for distributed tracing
- [ ] ELK stack for log aggregation
- [ ] Alert rules configured
- [ ] Custom metrics instrumented
- [ ] APM integration
- [ ] Error tracking with Sentry

### Technical Tasks
1. Deploy monitoring stack with Helm
2. Create Grafana dashboards for:
   - System metrics
   - Application metrics
   - Business KPIs
3. Configure alert rules
4. Set up PagerDuty integration
5. Create runbooks for common issues

### Definition of Done
- [ ] All services sending metrics
- [ ] Dashboards showing real-time data
- [ ] Alerts firing on test scenarios
- [ ] Logs searchable in Kibana
- [ ] Traces visible in Jaeger
- [ ] Runbooks accessible to team

---

## Sprint 0 Summary

### Total Story Points: 47
### Duration: 1 week (5 working days)
### Team Capacity: 50 points (10 points/day)

### Critical Path:
1. Story 0.1 (Repository) → Day 1
2. Story 0.2 (Database) + Story 0.3 (API) → Day 2-3
3. Story 0.4 (External APIs) + Story 0.5 (Testing) → Day 3-4
4. Story 0.6 (Dev Environment) → Day 4
5. Story 0.7 (CI/CD) + Story 0.8 (Monitoring) → Day 5

### Success Metrics:
- All P0 stories completed
- Development environment fully functional
- First microservice deployable
- Team unblocked for Sprint 1

### Risks:
- External API key acquisition delays
- Database setup complexity
- Team onboarding to new tools

### Next Sprint Preview:
Sprint 1 will focus on User Management (Epic 001) with authentication, KYC, and user profiles.