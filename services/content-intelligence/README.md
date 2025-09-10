# Content Intelligence Engine

AI-Powered Content Intelligence Engine & Multi-Platform Publishing Service for TREUM Finance Platform

## Overview

The Content Intelligence Engine is a sophisticated microservice that provides AI-powered content generation, optimization, and multi-platform publishing capabilities specifically designed for financial services. It integrates with multiple AI models, ensures regulatory compliance, and delivers high-quality, personalized financial content.

## Features

### 🤖 AI Content Generation
- Multi-AI model integration (OpenAI GPT-4, Anthropic Claude, Google Gemini)
- Financial domain expertise with market data integration
- Real-time news analysis and sentiment integration
- Quality scoring with automated improvement suggestions

### 📋 Compliance & Risk Management
- Automated SEC, FINRA, GDPR compliance validation
- Real-time regulatory rule updates
- Risk assessment and mitigation
- Required disclaimer generation

### 🎯 Content Personalization
- Industry and role-based personalization
- Audience segmentation and targeting
- Tone and complexity adaptation
- Market context integration

### 📊 Analytics & Performance
- Cross-platform engagement tracking
- Content performance optimization
- ROI measurement and attribution
- Custom reporting and dashboards

### 🔄 Multi-Platform Publishing
- Native integration with major platforms
- Platform-specific optimization
- Intelligent scheduling
- Bulk publishing operations

### 📝 Template Management
- 100+ pre-built financial content templates
- Custom template creation and management
- Template performance analytics
- Usage tracking and optimization

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Content Intelligence Engine                   │
├─────────────────────────────────────────────────────────────────┤
│  Controllers  │  Services  │  AI Models  │  External APIs       │
├─────────────────────────────────────────────────────────────────┤
│  Generation   │  OpenAI    │  GPT-4      │  Market Data         │
│  Publishing   │  Claude    │  Claude-3   │  News APIs           │
│  Analytics    │  Gemini    │  Gemini     │  Social Platforms    │
│  Compliance   │  Quality   │  Custom     │  Regulatory Data     │
└─────────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (for containerized deployment)

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=content_intelligence

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your_jwt_secret

# AI Model APIs
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_PROJECT_ID=your_google_project

# Service Configuration
PORT=3005
NODE_ENV=development
CORS_ORIGINS=*
```

### Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

3. **Development Mode**
   ```bash
   npm run start:dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm run start:prod
   ```

### Docker Deployment

1. **Build and Start Services**
   ```bash
   docker-compose up -d
   ```

2. **Check Service Health**
   ```bash
   curl http://localhost:3005/health
   ```

## API Documentation

Once running, access the interactive API documentation at:
- **Development**: http://localhost:3005/api/docs
- **Production**: https://your-domain/api/docs

### Key Endpoints

#### Content Generation
- `POST /api/v1/content/generate` - Generate new content
- `POST /api/v1/content/{id}/regenerate` - Regenerate content
- `POST /api/v1/content/bulk/generate` - Bulk content generation

#### Content Management
- `GET /api/v1/content` - List generated content
- `GET /api/v1/content/{id}` - Get content details
- `PUT /api/v1/content/{id}` - Update content
- `DELETE /api/v1/content/{id}` - Delete content

#### Templates
- `GET /api/v1/content/templates` - List templates
- `POST /api/v1/content/templates` - Create template

#### Analytics
- `GET /api/v1/analytics/content/{id}` - Content performance
- `GET /api/v1/analytics/trends` - Performance trends

## Development

### Project Structure

```
src/
├── controllers/          # API Controllers
├── services/            # Business Logic Services
├── entities/            # Database Entities
├── dto/                # Data Transfer Objects
├── modules/            # NestJS Modules
├── guards/             # Authentication Guards
├── strategies/         # Passport Strategies
├── config/             # Configuration Files
├── utils/              # Utility Functions
└── templates/          # Content Templates
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

### Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Configuration

### AI Model Configuration

Configure AI models in `src/config/ai.config.ts`:

```typescript
export const aiConfig = registerAs('ai', () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229',
    maxTokens: 2000,
  },
  defaultProvider: 'openai',
  qualityThreshold: 8.0,
}));
```

### Database Schema

The service uses PostgreSQL with the following main entities:
- `content_templates` - Content template definitions
- `generated_content` - Generated content records
- `platform_optimized_content` - Platform-specific optimizations
- `content_analytics` - Performance metrics
- `compliance_rules` - Regulatory rules
- `content_approval_workflows` - Approval processes

## Monitoring & Observability

### Health Checks
- Service: `GET /health`
- Database: Automatic connection monitoring
- Redis: Connection and memory monitoring

### Logging
- Structured JSON logging with Winston
- Request/response logging
- Error tracking and alerting
- Performance metrics

### Metrics
- Content generation volume
- AI model usage and costs
- Quality scores and improvements
- Platform publishing success rates
- Compliance validation results

## Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- API key management for external services

### Data Protection
- Encrypted sensitive data at rest
- Secure API communication (HTTPS)
- Input validation and sanitization
- SQL injection prevention

### Compliance
- GDPR compliance for user data
- Financial regulation adherence
- Audit trail maintenance
- Data retention policies

## Performance

### Optimization Features
- Connection pooling for database
- Redis caching for frequently accessed data
- Async processing for heavy operations
- Rate limiting for API endpoints

### Scalability
- Horizontal scaling support
- Queue-based async processing
- Database read replicas
- CDN integration for static assets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commits
- Update documentation for new features
- Ensure all CI checks pass

## License

This project is proprietary software owned by TREUM ALGOTECH. All rights reserved.

## Support

For support and questions:
- Technical Issues: Create a GitHub issue
- Security Concerns: Contact security@treum.ai
- General Questions: Contact support@treum.ai

---

**Content Intelligence Engine v1.0.0**  
Built with ❤️ for the TREUM Finance Platform