# AI Finance Agency - Docker Orchestration Makefile
# Simplifies common Docker Compose operations

# Default environment
ENV ?= development

# Docker Compose files
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV := docker-compose.override.yml
COMPOSE_PROD := docker-compose.prod.yml

# Common profiles
INFRASTRUCTURE_PROFILE := infrastructure
MICROSERVICES_PROFILE := microservices
MONITORING_PROFILE := monitoring
LOGGING_PROFILE := logging

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

.PHONY: help build up down logs ps clean setup-dirs check-env

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "$(GREEN)AI Finance Agency - Docker Orchestration$(NC)"
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Environment setup
setup-dirs: ## Create required directories for persistent volumes
	@echo "$(GREEN)Creating required directories...$(NC)"
	@mkdir -p data/{postgres,redis,rabbitmq,mongodb,consul,prometheus,grafana,elasticsearch}
	@mkdir -p logs/{api-gateway,user-management,trading,signals,payment,education,market-data,risk-management,notification,content-intelligence,worker,scheduler,nginx}
	@mkdir -p infrastructure/{nginx/{conf.d,ssl},consul,rabbitmq,mongodb,postgres,worker,scheduler}
	@mkdir -p monitoring/{prometheus/{rules},grafana/{dashboards,datasources,plugins},logstash/{config,pipeline}}
	@chmod -R 755 data logs infrastructure monitoring
	@echo "$(GREEN)Directories created successfully!$(NC)"

check-env: ## Check if .env file exists
	@if [ ! -f .env ]; then \
		echo "$(RED)Error: .env file not found!$(NC)"; \
		echo "$(YELLOW)Please copy .env.example to .env and configure it.$(NC)"; \
		exit 1; \
	fi

# Build targets
build: check-env ## Build all services
	@echo "$(GREEN)Building all services...$(NC)"
	docker-compose build

build-dev: check-env ## Build services for development
	@echo "$(GREEN)Building services for development...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV) build

build-prod: check-env ## Build services for production
	@echo "$(GREEN)Building services for production...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) build

# Start/Stop targets
up-infrastructure: check-env setup-dirs ## Start only infrastructure services
	@echo "$(GREEN)Starting infrastructure services...$(NC)"
	docker-compose --profile $(INFRASTRUCTURE_PROFILE) up -d

up-dev: check-env setup-dirs ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose --profile development --profile $(INFRASTRUCTURE_PROFILE) --profile $(MICROSERVICES_PROFILE) up -d

up-full: check-env setup-dirs ## Start full stack (development + monitoring)
	@echo "$(GREEN)Starting full development stack...$(NC)"
	docker-compose --profile development --profile $(INFRASTRUCTURE_PROFILE) --profile $(MICROSERVICES_PROFILE) --profile $(MONITORING_PROFILE) up -d

up-prod: check-env setup-dirs ## Start production environment
	@echo "$(GREEN)Starting production environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) --profile production --profile $(INFRASTRUCTURE_PROFILE) --profile $(MICROSERVICES_PROFILE) --profile $(MONITORING_PROFILE) up -d

up-prod-logging: check-env setup-dirs ## Start production with logging (ELK stack)
	@echo "$(GREEN)Starting production with logging...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) --profile production --profile $(INFRASTRUCTURE_PROFILE) --profile $(MICROSERVICES_PROFILE) --profile $(MONITORING_PROFILE) --profile $(LOGGING_PROFILE) up -d

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down

down-volumes: ## Stop all services and remove volumes
	@echo "$(RED)Stopping all services and removing volumes...$(NC)"
	docker-compose down -v

# Service management
restart: ## Restart all services
	@echo "$(YELLOW)Restarting all services...$(NC)"
	docker-compose restart

restart-service: ## Restart specific service (usage: make restart-service SERVICE=api-gateway)
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(RED)Error: Please specify SERVICE=<service-name>$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restarting $(SERVICE)...$(NC)"
	docker-compose restart $(SERVICE)

# Monitoring and debugging
logs: ## Show logs for all services
	docker-compose logs -f

logs-service: ## Show logs for specific service (usage: make logs-service SERVICE=api-gateway)
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(RED)Error: Please specify SERVICE=<service-name>$(NC)"; \
		exit 1; \
	fi
	docker-compose logs -f $(SERVICE)

ps: ## Show running services
	docker-compose ps

top: ## Show running processes in services
	docker-compose top

stats: ## Show resource usage statistics
	docker stats

# Health checks
health-check: ## Check health of all services
	@echo "$(GREEN)Checking service health...$(NC)"
	@for service in api-gateway user-management trading signals payment education market-data risk-management notification content-intelligence; do \
		echo "Checking $$service..."; \
		curl -f -s http://localhost:$$(docker-compose port $$service | cut -d':' -f2)/health > /dev/null && \
			echo "$(GREEN)✓ $$service is healthy$(NC)" || \
			echo "$(RED)✗ $$service is unhealthy$(NC)"; \
	done

# Database operations
db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	docker-compose run --rm migrations

db-reset: ## Reset database (WARNING: This will delete all data!)
	@echo "$(RED)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		docker-compose down postgres; \
		docker volume rm ai-finance-agency_postgres_data || true; \
		echo "$(GREEN)Database reset completed.$(NC)"; \
	else \
		echo ""; \
		echo "$(YELLOW)Operation cancelled.$(NC)"; \
	fi

# Cleanup
clean: ## Clean up unused Docker resources
	@echo "$(YELLOW)Cleaning up unused Docker resources...$(NC)"
	docker system prune -f
	docker volume prune -f

clean-all: ## Clean up all Docker resources (WARNING: This removes everything!)
	@echo "$(RED)WARNING: This will remove all Docker containers, images, and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		docker-compose down -v --rmi all; \
		docker system prune -a -f; \
		echo "$(GREEN)Complete cleanup done.$(NC)"; \
	else \
		echo ""; \
		echo "$(YELLOW)Operation cancelled.$(NC)"; \
	fi

# Development helpers
dev-build: build-dev up-dev ## Build and start development environment

shell: ## Open shell in specific service container (usage: make shell SERVICE=api-gateway)
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(RED)Error: Please specify SERVICE=<service-name>$(NC)"; \
		exit 1; \
	fi
	docker-compose exec $(SERVICE) /bin/sh

# Production deployment
deploy: ## Deploy to production (builds and starts production environment)
	@echo "$(GREEN)Deploying to production...$(NC)"
	$(MAKE) build-prod
	$(MAKE) up-prod
	$(MAKE) health-check

# Backup operations
backup-db: ## Create database backup
	@echo "$(GREEN)Creating database backup...$(NC)"
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	docker-compose exec postgres pg_dumpall -U ai_finance_user > ./backups/db_backup_$$timestamp.sql; \
	echo "$(GREEN)Backup created: ./backups/db_backup_$$timestamp.sql$(NC)"

# Configuration validation
validate-config: ## Validate docker-compose configuration
	@echo "$(GREEN)Validating Docker Compose configuration...$(NC)"
	docker-compose config --quiet && echo "$(GREEN)✓ Configuration is valid$(NC)" || echo "$(RED)✗ Configuration has errors$(NC)"

# Quick commands
quick-start: setup-dirs up-dev ## Quick start for development (creates dirs + starts dev environment)
quick-stop: down ## Quick stop all services

# ============================================================================
# GitHub Container Registry (GHCR) Management
# ============================================================================

# GHCR Configuration
GHCR_REGISTRY := ghcr.io
GHCR_OWNER := $(shell git config user.name | tr '[:upper:]' '[:lower:]' | tr -d ' ')
GHCR_PREFIX := $(GHCR_OWNER)/ai-finance-agency
GITHUB_TOKEN ?= $(shell echo $$GITHUB_TOKEN)

.PHONY: ghcr-login ghcr-build ghcr-push ghcr-pull ghcr-list ghcr-clean ghcr-security-scan ghcr-sign ghcr-verify

ghcr-login: ## Login to GitHub Container Registry
	@if [ -z "$(GITHUB_TOKEN)" ]; then \
		echo "$(RED)Error: GITHUB_TOKEN environment variable not set$(NC)"; \
		echo "$(YELLOW)Please set GITHUB_TOKEN with: export GITHUB_TOKEN=ghp_xxxxxxxxxxxx$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Logging in to GitHub Container Registry...$(NC)"
	@echo "$(GITHUB_TOKEN)" | docker login $(GHCR_REGISTRY) -u $(GHCR_OWNER) --password-stdin

ghcr-build: ## Build all service images for GHCR
	@echo "$(GREEN)Building all service images for GHCR...$(NC)"
	@for service in $$(ls services/); do \
		if [ -f "services/$$service/Dockerfile" ]; then \
			echo "$(YELLOW)Building $$service...$(NC)"; \
			docker build -t $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:latest \
				--build-arg SERVICE_NAME=$$service \
				--build-arg BUILD_VERSION=latest \
				--build-arg BUILD_TIMESTAMP=$$(date -u +%Y-%m-%dT%H:%M:%SZ) \
				--build-arg GIT_COMMIT=$$(git rev-parse HEAD) \
				--build-arg GIT_BRANCH=$$(git rev-parse --abbrev-ref HEAD) \
				services/$$service/; \
		else \
			echo "$(YELLOW)No Dockerfile found for $$service, skipping...$(NC)"; \
		fi; \
	done
	@echo "$(GREEN)All images built successfully!$(NC)"

ghcr-push: ghcr-login ## Push all service images to GHCR
	@echo "$(GREEN)Pushing all service images to GHCR...$(NC)"
	@for service in $$(ls services/); do \
		if docker image inspect $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:latest >/dev/null 2>&1; then \
			echo "$(YELLOW)Pushing $$service...$(NC)"; \
			docker push $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:latest; \
		else \
			echo "$(YELLOW)Image not found for $$service, skipping...$(NC)"; \
		fi; \
	done
	@echo "$(GREEN)All images pushed successfully!$(NC)"

ghcr-pull: ghcr-login ## Pull all service images from GHCR
	@echo "$(GREEN)Pulling all service images from GHCR...$(NC)"
	@for service in $$(ls services/); do \
		echo "$(YELLOW)Pulling $$service...$(NC)"; \
		docker pull $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:latest || \
			echo "$(RED)Failed to pull $$service (may not exist in registry)$(NC)"; \
	done
	@echo "$(GREEN)Pull completed!$(NC)"

ghcr-list: ## List all images in GHCR registry
	@echo "$(GREEN)Listing GHCR registry images...$(NC)"
	@./scripts/registry-management.sh list-images

ghcr-clean: ## Clean up old GHCR images (keeps last 5 versions)
	@echo "$(YELLOW)Cleaning up old GHCR images...$(NC)"
	@./scripts/registry-management.sh cleanup 30

ghcr-security-scan: ## Run security scan on all GHCR images
	@echo "$(GREEN)Running security scan on GHCR images...$(NC)"
	@./scripts/registry-management.sh scan-security latest

ghcr-sign: ## Sign all GHCR images with cosign
	@echo "$(GREEN)Signing GHCR images...$(NC)"
	@./scripts/registry-management.sh sign-images latest

ghcr-verify: ## Verify signatures of all GHCR images
	@echo "$(GREEN)Verifying GHCR image signatures...$(NC)"
	@./scripts/registry-management.sh verify-images latest

ghcr-health: ## Check GHCR connectivity and permissions
	@echo "$(GREEN)Checking GHCR health...$(NC)"
	@./scripts/registry-management.sh health-check

ghcr-sync: ## Sync local images with GHCR registry
	@echo "$(GREEN)Syncing with GHCR registry...$(NC)"
	@./scripts/registry-management.sh sync-registry

# Quick development workflows
ghcr-dev-push: ghcr-build ghcr-push ## Build and push images for development
	@echo "$(GREEN)Development images built and pushed!$(NC)"

ghcr-prod-deploy: ## Tag and push production release
	@if [ -z "$(VERSION)" ]; then \
		echo "$(RED)Error: Please specify VERSION=x.y.z$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Preparing production release $(VERSION)...$(NC)"
	@for service in $$(ls services/); do \
		if docker image inspect $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:latest >/dev/null 2>&1; then \
			echo "$(YELLOW)Tagging $$service:$(VERSION)...$(NC)"; \
			docker tag $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:latest $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:$(VERSION); \
			docker push $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:$(VERSION); \
		fi; \
	done
	@echo "$(GREEN)Production release $(VERSION) deployed!$(NC)"

# Multi-architecture build support
ghcr-multiarch: ## Build multi-architecture images (requires Docker Buildx)
	@echo "$(GREEN)Building multi-architecture images...$(NC)"
	@docker buildx inspect multiarch-builder >/dev/null 2>&1 || \
		docker buildx create --name multiarch-builder --use
	@for service in $$(ls services/); do \
		if [ -f "services/$$service/Dockerfile" ]; then \
			echo "$(YELLOW)Building multi-arch $$service...$(NC)"; \
			docker buildx build --platform linux/amd64,linux/arm64 \
				-t $(GHCR_REGISTRY)/$(GHCR_PREFIX)/$$service:latest \
				--build-arg SERVICE_NAME=$$service \
				--build-arg BUILD_VERSION=latest \
				--build-arg BUILD_TIMESTAMP=$$(date -u +%Y-%m-%dT%H:%M:%SZ) \
				--build-arg GIT_COMMIT=$$(git rev-parse HEAD) \
				--build-arg GIT_BRANCH=$$(git rev-parse --abbrev-ref HEAD) \
				--push \
				services/$$service/; \
		fi; \
	done
	@echo "$(GREEN)Multi-architecture images built and pushed!$(NC)"

# Help section for GHCR commands
ghcr-help: ## Show GHCR-specific help
	@echo "$(GREEN)AI Finance Agency - GHCR Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Authentication:$(NC)"
	@echo "  ghcr-login           - Login to GitHub Container Registry"
	@echo "  ghcr-health          - Check connectivity and permissions"
	@echo ""
	@echo "$(YELLOW)Image Management:$(NC)"
	@echo "  ghcr-build           - Build all service images"
	@echo "  ghcr-push            - Push all images to registry"
	@echo "  ghcr-pull            - Pull all images from registry"
	@echo "  ghcr-list            - List all images in registry"
	@echo "  ghcr-sync            - Sync local images with registry"
	@echo ""
	@echo "$(YELLOW)Security:$(NC)"
	@echo "  ghcr-security-scan   - Run security scan on images"
	@echo "  ghcr-sign            - Sign images with cosign"
	@echo "  ghcr-verify          - Verify image signatures"
	@echo ""
	@echo "$(YELLOW)Maintenance:$(NC)"
	@echo "  ghcr-clean           - Clean up old images"
	@echo "  ghcr-multiarch       - Build multi-architecture images"
	@echo ""
	@echo "$(YELLOW)Workflows:$(NC)"
	@echo "  ghcr-dev-push        - Build and push for development"
	@echo "  ghcr-prod-deploy     - Deploy production release (requires VERSION=x.y.z)"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make ghcr-dev-push                    # Build and push development images"
	@echo "  make ghcr-prod-deploy VERSION=1.2.3  # Deploy production release"
	@echo "  make ghcr-security-scan              # Run security scan"