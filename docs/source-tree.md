# 3. SOURCE TREE DOCUMENTATION

## 3.1 Project Structure
```
treum-algotech/
├── .github/                      # GitHub configuration
│   ├── workflows/                # CI/CD workflows
│   │   ├── ci.yml               # Continuous integration
│   │   ├── cd-production.yml    # Production deployment
│   │   └── security-scan.yml    # Security scanning
│   └── CODEOWNERS              # Code ownership
│
├── apps/                         # Application packages
│   ├── web/                     # Next.js web application
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utility functions
│   │   │   ├── services/       # API services
│   │   │   ├── store/          # Redux store
│   │   │   └── styles/         # Global styles
│   │   ├── public/             # Static assets
│   │   └── next.config.js      # Next.js configuration
│   │
│   ├── mobile/                  # React Native application
│   │   ├── src/
│   │   │   ├── screens/        # Screen components
│   │   │   ├── components/     # Shared components
│   │   │   ├── navigation/     # Navigation setup
│   │   │   └── services/       # Mobile services
│   │   └── app.json            # Expo configuration
│   │
│   └── admin/                   # Admin dashboard
│       ├── src/
│       └── vite.config.ts      # Vite configuration
│
├── services/                    # Microservices
│   ├── user-management/        # User service
│   │   ├── src/
│   │   │   ├── controllers/    # API controllers
│   │   │   ├── services/       # Business logic
│   │   │   ├── models/         # Data models
│   │   │   ├── repositories/   # Data access
│   │   │   └── utils/          # Utilities
│   │   ├── tests/              # Service tests
│   │   └── Dockerfile          # Container definition
│   │
│   ├── education/              # Education service
│   │   ├── src/
│   │   └── Dockerfile
│   │
│   ├── signals/                # Signal generation service
│   │   ├── src/
│   │   └── Dockerfile
│   │
│   ├── trading/                # Trading service
│   │   ├── src/
│   │   └── Dockerfile
│   │
│   ├── payment/                # Payment service
│   │   ├── src/
│   │   └── Dockerfile
│   │
│   └── notification/           # Notification service
│       ├── src/
│       └── Dockerfile
│
├── packages/                    # Shared packages
│   ├── ui/                     # UI component library
│   │   ├── src/
│   │   │   ├── components/     # Shared components
│   │   │   └── tokens/         # Design tokens
│   │   └── package.json
│   │
│   ├── types/                  # TypeScript types
│   │   ├── src/
│   │   │   ├── api/           # API types
│   │   │   ├── models/        # Data models
│   │   │   └── interfaces/    # Shared interfaces
│   │   └── package.json
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   │   ├── validation/    # Validators
│   │   │   ├── encryption/    # Encryption utils
│   │   │   └── helpers/       # Helper functions
│   │   └── package.json
│   │
│   └── config/                 # Configuration
│       ├── eslint/            # ESLint config
│       ├── prettier/          # Prettier config
│       └── tsconfig/          # TypeScript config
│
├── infrastructure/             # Infrastructure as Code
│   ├── kubernetes/            # K8s manifests
│   │   ├── base/             # Base configurations
│   │   ├── overlays/         # Environment overlays
│   │   └── kustomization.yaml
│   │
│   ├── terraform/            # Terraform modules
│   │   ├── modules/          # Reusable modules
│   │   ├── environments/     # Environment configs
│   │   └── main.tf
│   │
│   └── docker/               # Docker configurations
│       ├── base.Dockerfile   # Base image
│       └── docker-compose.yml
│
├── scripts/                   # Build and utility scripts
│   ├── setup.sh              # Initial setup
│   ├── deploy.sh             # Deployment script
│   └── migrate.sh            # Database migrations
│
├── docs/                      # Documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture docs
│   ├── guides/               # Developer guides
│   └── runbooks/             # Operational runbooks
│
├── tests/                     # End-to-end tests
│   ├── e2e/                  # E2E test suites
│   ├── integration/          # Integration tests
│   └── performance/          # Performance tests
│
├── migrations/                # Database migrations
│   ├── postgres/             # PostgreSQL migrations
│   └── mongodb/              # MongoDB migrations
│
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── docker-compose.yml        # Local development setup
├── package.json              # Root package.json
├── pnpm-workspace.yaml       # PNPM workspace config
├── turbo.json                # Turborepo config
└── README.md                 # Project documentation
```

## 3.2 Service-Specific Structure
```
service/
├── src/
│   ├── api/                  # API layer
│   │   ├── routes/           # Route definitions
│   │   ├── middleware/       # Express middleware
│   │   └── validators/       # Request validators
│   │
│   ├── application/          # Application layer
│   │   ├── services/         # Business logic
│   │   ├── use-cases/        # Use case implementations
│   │   └── dto/              # Data transfer objects
│   │
│   ├── domain/               # Domain layer
│   │   ├── entities/         # Domain entities
│   │   ├── value-objects/    # Value objects
│   │   └── repositories/     # Repository interfaces
│   │
│   ├── infrastructure/       # Infrastructure layer
│   │   ├── database/         # Database implementations
│   │   ├── cache/            # Cache implementations
│   │   ├── messaging/        # Message queue
│   │   └── external/         # External services
│   │
│   └── main.ts               # Application entry point
│
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── fixtures/             # Test fixtures
│
├── config/                   # Service configuration
│   ├── default.json         # Default config
│   ├── production.json      # Production config
│   └── test.json            # Test config
│
└── Dockerfile               # Service container
```

---
