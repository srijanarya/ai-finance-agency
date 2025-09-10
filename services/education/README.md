# Education Microservice

<p align="center">
  🎓 A comprehensive education microservice for the AI Finance Agency platform
</p>

<p align="center">
  Providing course management, progress tracking, assessments, and certificates for financial education.
</p>

## Description

A production-ready NestJS microservice built for managing educational content focused on trading and finance. Features include course management, lesson delivery, user progress tracking, automated assessments, and certificate generation.

## Features

### Core Features
- **Course Management**: Complete CRUD operations for financial courses with rich metadata
- **Lesson Management**: Video lessons, documents, quizzes, and interactive content
- **User Progress Tracking**: Real-time tracking with bookmarks, notes, and completion analytics
- **Assessments & Quizzes**: Interactive assessments with automatic grading and multiple attempts
- **Certificates**: Automated certificate generation with verification codes
- **Categories**: Hierarchical organization of educational content

### Educational Content Types
- Trading fundamentals and strategies
- Investment analysis and portfolio management
- Risk management and hedging
- Market analysis and technical indicators
- Financial planning and wealth management
- Cryptocurrency and DeFi education

## Architecture

### Database Entities
- **Category**: Hierarchical course categorization
- **Course**: Rich course metadata with pricing and publishing
- **Lesson**: Individual lessons with multiple content types
- **UserProgress**: Detailed progress tracking per user/course/lesson
- **Assessment**: Quiz and test management
- **AssessmentAttempt**: Individual quiz attempts with scoring
- **Certificate**: Generated certificates with verification

### API Endpoints
```
# Course Management
GET    /api/v1/courses                 # List courses with filters
POST   /api/v1/courses                 # Create new course
GET    /api/v1/courses/:id             # Get course details
PATCH  /api/v1/courses/:id             # Update course
POST   /api/v1/courses/:id/publish     # Publish course
POST   /api/v1/courses/enroll          # Enroll in course

# Progress Tracking
GET    /api/v1/progress/stats          # User learning statistics
GET    /api/v1/progress/course/:id     # Course progress
PATCH  /api/v1/progress/lesson/:id     # Update lesson progress
POST   /api/v1/progress/lesson/:id/quiz # Submit quiz answers

# Health & Monitoring
GET    /health                         # Service health check
```

## Project setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation
```bash
$ npm install
```

### Environment Configuration
```bash
# Copy example environment file
$ cp .env.example .env

# Edit configuration
$ nano .env
```

### Database Setup
```bash
# The service will auto-create tables using TypeORM synchronization
# Make sure PostgreSQL is running and database exists
```

## Development

```bash
# Start in watch mode
$ npm run start:dev

# The service will be available at http://localhost:3003
# Swagger docs at http://localhost:3003/api/docs
```

## Production Deployment

```bash
# Build the application
$ npm run build

# Start production server
$ npm run start:prod
```

## Testing

```bash
# Unit tests
$ npm run test

# End-to-end tests
$ npm run test:e2e

# Test coverage report
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
