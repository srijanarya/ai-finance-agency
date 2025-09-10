# GitHub Container Registry (GHCR) Setup Guide

This guide covers the complete setup and configuration of GitHub Container Registry (GHCR) for the AI Finance Agency project, including automated Docker builds, security scanning, and multi-architecture support.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Repository Configuration](#repository-configuration)
- [Workflows](#workflows)
- [Usage](#usage)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🌟 Overview

The AI Finance Agency uses GitHub Container Registry (GHCR) for:

- **Automated Docker builds** for all 10 microservices
- **Multi-architecture support** (linux/amd64, linux/arm64)
- **Security scanning** with Trivy
- **Semantic versioning** based on conventional commits
- **Layer caching** for faster builds
- **Image signing** with Cosign for supply chain security

### Supported Services

The following microservices are automatically built and deployed:

- `api-gateway` - Main API gateway service
- `content-intelligence` - AI content analysis service
- `education` - Educational content service
- `market-data` - Market data processing service
- `notification` - Notification service
- `payment` - Payment processing service
- `risk-management` - Risk assessment service
- `signals` - Trading signals service
- `trading` - Trading execution service
- `user-management` - User management service

## ✅ Prerequisites

### Repository Setup

1. **GitHub repository** with appropriate permissions
2. **Personal Access Token** with `packages:write` scope
3. **Repository secrets** configured (handled automatically)

### Local Development

```bash
# Install Docker with Buildx support
docker --version
docker buildx version

# Install cosign for image signing (optional)
go install github.com/sigstore/cosign/v2/cmd/cosign@latest
```

## 🔧 Repository Configuration

### Automatic Configuration

The workflows automatically handle most configuration, but you can customize:

1. **Repository Settings → Actions → General**
   - ✅ Allow all actions and reusable workflows
   - ✅ Allow actions created by GitHub
   - ✅ Allow specified actions and reusable workflows

2. **Repository Settings → Actions → Workflow permissions**
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

### Environment Variables

The workflows use these environment variables:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME_PREFIX: ${{ github.repository_owner }}/ai-finance-agency
  PLATFORMS: linux/amd64,linux/arm64
```

## 🚀 Workflows

### 1. Docker Build Workflow (`.github/workflows/docker-build.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual dispatch with options

**Features:**
- ✅ Parallel builds for all services
- ✅ Semantic versioning based on git history
- ✅ Multi-architecture builds (amd64, arm64)
- ✅ GitHub Actions cache for layers
- ✅ SBOM (Software Bill of Materials) generation
- ✅ Automatic image cleanup (keeps last 5 versions)

**Image Tags Generated:**
```
ghcr.io/username/ai-finance-agency/service-name:latest
ghcr.io/username/ai-finance-agency/service-name:v1.2.3
ghcr.io/username/ai-finance-agency/service-name:main-abc12345
ghcr.io/username/ai-finance-agency/service-name:pr-123
```

### 2. Security Scanning Workflow (`.github/workflows/docker-security.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests
- Daily scheduled scans at 2 AM UTC
- Manual dispatch with severity options

**Security Features:**
- 🔒 Trivy vulnerability scanning
- 🔒 Configuration security scanning
- 🔒 SARIF upload to GitHub Security tab
- 🔒 Image signing with Cosign
- 🔒 Automated security reports

**Supported Severity Levels:**
- `UNKNOWN` - Unknown vulnerabilities
- `LOW` - Low severity issues
- `MEDIUM` - Medium severity issues (default)
- `HIGH` - High severity issues
- `CRITICAL` - Critical vulnerabilities

### 3. Multi-Architecture Workflow (`.github/workflows/docker-multiarch.yml`)

**Triggers:**
- Push to `main` with service changes
- Manual dispatch with platform options

**Features:**
- 🏗️ QEMU emulation for cross-platform builds
- 🏗️ Optimized layer caching strategies
- 🏗️ Smart change detection (only builds modified services)
- 🏗️ Platform testing for each architecture

**Supported Platforms:**
- `linux/amd64` - Standard x86_64 architecture
- `linux/arm64` - ARM 64-bit architecture (Apple M1, AWS Graviton, etc.)

## 📖 Usage

### Automatic Builds

Builds trigger automatically on:

```bash
# Push to main branch
git push origin main

# Create pull request
gh pr create --title "Feature: New functionality"

# Create release tag
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

### Manual Builds

Trigger manual builds via GitHub Actions UI or API:

```bash
# Using GitHub CLI
gh workflow run docker-build.yml

# With custom parameters
gh workflow run docker-multiarch.yml \
  --field target_platforms="linux/amd64,linux/arm64" \
  --field cache_strategy="registry"
```

### Pulling Images

```bash
# Pull latest version
docker pull ghcr.io/username/ai-finance-agency/api-gateway:latest

# Pull specific version
docker pull ghcr.io/username/ai-finance-agency/api-gateway:v1.2.3

# Pull for specific architecture
docker pull --platform linux/arm64 ghcr.io/username/ai-finance-agency/api-gateway:latest

# Login to GHCR (required for private repos)
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin
```

### Using in Docker Compose

```yaml
version: '3.8'
services:
  api-gateway:
    image: ghcr.io/username/ai-finance-agency/api-gateway:latest
    platforms:
      - linux/amd64
      - linux/arm64
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
```

### Using in Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: ghcr.io/username/ai-finance-agency/api-gateway:v1.2.3
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 🔒 Security

### Vulnerability Scanning

All images are automatically scanned with Trivy:

- **Vulnerability Detection**: CVE database scanning
- **Configuration Scanning**: Dockerfile and Kubernetes manifest security
- **Secret Detection**: Hardcoded secrets and API keys
- **License Compliance**: Software license analysis

### Image Signing

Images pushed to main branch are signed with Cosign:

```bash
# Verify image signature
cosign verify ghcr.io/username/ai-finance-agency/api-gateway:latest \
  --certificate-identity-regexp=".*" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```

### Security Reports

Security reports are available in:

- **GitHub Security Tab** - SARIF format for integration
- **GitHub Actions Artifacts** - Detailed reports per service
- **Weekly Summary** - Aggregated security status

### Security Best Practices

1. **Regular Updates**: Dependencies updated via Dependabot
2. **Minimal Base Images**: Using Alpine Linux where possible
3. **Non-Root Users**: Containers run as non-privileged users
4. **Resource Limits**: CPU and memory limits defined
5. **Health Checks**: Comprehensive health check endpoints

## 🔧 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check workflow logs
gh run list --workflow=docker-build.yml
gh run view [run-id] --log

# Debug locally
docker buildx build --platform linux/amd64,linux/arm64 \
  -t test-image \
  services/api-gateway/

# Clear cache
docker buildx prune -f
```

#### Authentication Issues

```bash
# Check token permissions
gh api user
gh api user/packages

# Re-authenticate
gh auth refresh
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin
```

#### Multi-Architecture Issues

```bash
# Check QEMU support
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

# List available platforms
docker buildx ls

# Create new builder
docker buildx create --name mybuilder --use
docker buildx inspect --bootstrap
```

### Performance Issues

```bash
# Monitor build times
gh run list --workflow=docker-build.yml --json | jq '.[].timing'

# Analyze layer caching
docker buildx du
docker system df

# Optimize Dockerfiles
docker buildx build --progress=plain services/api-gateway/
```

### Debug Commands

```bash
# Test tagging script locally
./scripts/docker-tag.sh

# Inspect image metadata
docker inspect ghcr.io/username/ai-finance-agency/api-gateway:latest

# Check image layers
docker history ghcr.io/username/ai-finance-agency/api-gateway:latest

# Test security scanning locally
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image \
  ghcr.io/username/ai-finance-agency/api-gateway:latest
```

## 📋 Best Practices

### Development Workflow

1. **Feature Branches**: Create feature branches for development
2. **Conventional Commits**: Use conventional commit format for automatic versioning
3. **Pull Requests**: Always use pull requests for code review
4. **Testing**: Ensure services have health check endpoints

### Dockerfile Optimization

```dockerfile
# Multi-stage builds
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 8080
USER node
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8080/health || exit 1
CMD ["npm", "start"]
```

### Version Management

- **Semantic Versioning**: Follow semver principles (major.minor.patch)
- **Conventional Commits**: Use conventional commit format
- **Release Tags**: Create git tags for releases
- **Branch Protection**: Protect main branch with required checks

### Cache Optimization

- **Layer Ordering**: Copy package files before source code
- **Build Context**: Use .dockerignore to exclude unnecessary files
- **Multi-stage**: Separate build and runtime stages
- **Cache Mounts**: Use BuildKit cache mounts for package managers

### Monitoring

- **Build Notifications**: Set up Slack/Discord webhooks
- **Security Alerts**: Enable GitHub security alerts
- **Performance Tracking**: Monitor build times and image sizes
- **Resource Usage**: Track registry storage usage

## 📚 Additional Resources

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Buildx Documentation](https://docs.docker.com/buildx/)
- [Trivy Security Scanner](https://trivy.dev/)
- [Cosign Image Signing](https://sigstore.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🤝 Contributing

When contributing to the AI Finance Agency:

1. Follow conventional commit format
2. Ensure Dockerfiles follow security best practices
3. Add health checks to new services
4. Update this documentation for new features
5. Test multi-architecture builds locally when possible

For questions or issues with the container registry setup, please create an issue in the repository.