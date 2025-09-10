# User Story: Environment Configuration
**Story ID**: ENV-001  
**Epic**: Sprint 1 Foundation Setup  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: Ready for Development  
**Sprint**: Sprint 1  

---

## User Story Statement

**As a** AI developer agent working on the AI Finance Agency system  
**I want** a completely configured development environment with all required API keys, database connections, and service integrations  
**So that** I can immediately begin implementing features without any environment setup blockers  

---

## Detailed Acceptance Criteria

### AC1: Core API Keys Configuration
**Given** the system requires multiple external API integrations  
**When** the environment is configured  
**Then** the following API keys must be present and validated in `.env` file:
- `OPENAI_API_KEY` - For AI content generation (Claude, GPT)
- `ANTHROPIC_API_KEY` - For Claude AI services  
- `GOOGLE_AI_KEY` - For Google AI services
- `PERPLEXITY_API_KEY` - For research and analysis (if required)

### AC2: Financial Data APIs Configuration
**Given** the system provides financial market analysis  
**When** environment is configured  
**Then** the following financial data API keys must be present:
- `ALPHA_VANTAGE_API_KEY` - For stock market data
- `FINNHUB_API_KEY` - For financial news and data
- `NEWS_API_KEY` - For news aggregation
- `POLYGON_API_KEY` - For market data (optional backup)

### AC3: Social Media Platform APIs
**Given** the system posts content to social platforms  
**When** environment is configured  
**Then** the following social media credentials must be configured:
- `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET`
- `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`
- `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_COMPANY_ID`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`
- `SLACK_BOT_TOKEN`, `SLACK_USER_TOKEN` (optional)

### AC4: Database Configuration
**Given** the system uses multiple database connections  
**When** environment is configured  
**Then** the following database settings must be configured:
- `DATABASE_PATH` - Primary SQLite database path
- `BACKUP_DATABASE_PATH` - Database backup location
- Redis connection details (if using Redis cache)
- Supabase connection strings (if using cloud database)

### AC5: Environment Validation System
**Given** all environment variables are configured  
**When** the validation script runs  
**Then** it must:
- Check presence of all required environment variables
- Validate API key formats (basic format validation)
- Test connectivity to external services (with fallback handling)
- Report missing or invalid configurations
- Create validation report with status of each service

### AC6: Environment File Management
**Given** multiple environment configurations may be needed  
**When** setting up the environment  
**Then** the system must:
- Have `.env.example` with all required variables documented
- Have separate environment files for different deployments (`.env.development`, `.env.production`)
- Implement proper environment variable loading with precedence
- Ensure `.env` files are properly gitignored

---

## Technical Requirements

### TR1: Environment Variable Structure
```bash
# Core AI Services
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...  
GOOGLE_AI_KEY=AIza...
PERPLEXITY_API_KEY=pplx-...

# Financial Data APIs
ALPHA_VANTAGE_API_KEY=...
FINNHUB_API_KEY=...
NEWS_API_KEY=...
POLYGON_API_KEY=...

# Social Media APIs
TWITTER_CONSUMER_KEY=...
TWITTER_CONSUMER_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_COMPANY_ID=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=...

# Database Configuration
DATABASE_PATH=data/agency.db
BACKUP_DATABASE_PATH=data/backup/
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Application Configuration
FLASK_PORT=5000
FLASK_DEBUG=False
SECRET_KEY=...
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### TR2: Configuration Loading Implementation
- Use `python-dotenv` for environment variable loading
- Implement configuration validation using the existing `config/config.py` structure
- Add configuration classes for new services (Supabase, Redis, etc.)
- Implement fallback values for non-critical configurations

### TR3: Environment Validation Script
Create `/Users/srijan/ai-finance-agency/validate_environment.py` with:
- Service connectivity tests
- API key format validation
- Database connection verification
- Comprehensive status reporting

### TR4: Database Connection Setup
- Configure SQLite databases for local development
- Set up Redis connection for caching (if used)
- Configure Supabase connection for cloud deployment
- Implement connection pooling and error handling

---

## Implementation Notes

### File Locations
- Main configuration: `/Users/srijan/ai-finance-agency/.env`
- Configuration classes: `/Users/srijan/ai-finance-agency/config/config.py`
- Environment template: `/Users/srijan/ai-finance-agency/.env.example`
- Validation script: `/Users/srijan/ai-finance-agency/validate_environment.py`
- Setup helper: `/Users/srijan/ai-finance-agency/setup_apis.py`

### Integration Points
- Extend existing `Config` class in `config/config.py`
- Update `APIConfig`, `DatabaseConfig` dataclasses
- Integrate with existing dashboard and platform systems
- Ensure compatibility with current `.env` structure

### Security Considerations
- Never commit actual API keys to repository
- Implement proper `.gitignore` patterns for credential files
- Use environment-specific configuration loading
- Implement API key rotation support structure

### Error Handling
- Graceful degradation when optional services are unavailable
- Clear error messages for missing critical configurations
- Fallback configurations for development vs production
- Comprehensive logging of configuration issues

---

## Definition of Done

- [ ] All required environment variables are documented in `.env.example`
- [ ] Configuration loading system supports all required services
- [ ] Environment validation script passes all checks
- [ ] Database connections are established and tested
- [ ] API connectivity is validated for all configured services
- [ ] Documentation is updated with environment setup instructions
- [ ] Error handling is implemented for missing/invalid configurations
- [ ] Security best practices are followed for credential management
- [ ] Integration tests pass for configuration loading
- [ ] All existing functionality continues to work with new configuration system

---

## Test Scenarios

### Happy Path Tests
1. **Complete Configuration**: All environment variables present and valid
   - Expected: All services initialize successfully
   - Validation script reports 100% success

2. **Minimal Configuration**: Only critical API keys present
   - Expected: System starts with reduced functionality
   - Non-critical services gracefully disabled

3. **Development vs Production**: Different configurations loaded properly
   - Expected: Environment-specific settings applied correctly

### Error Handling Tests
1. **Missing Critical API Keys**: OpenAI API key missing
   - Expected: System fails to start with clear error message
   - Validation script identifies missing critical dependencies

2. **Invalid API Key Format**: Malformed API keys
   - Expected: Format validation catches invalid keys
   - System provides helpful error messages

3. **Network Connectivity Issues**: External services unreachable
   - Expected: Graceful degradation with retry mechanisms
   - System continues operating with reduced functionality

### Integration Tests
1. **Database Connection Tests**: All database connections work
2. **API Service Tests**: All configured APIs respond correctly
3. **Configuration Reload Tests**: Environment changes picked up correctly
4. **Multi-Environment Tests**: Different environment files work correctly

---

## Dependencies and Blockers

### Dependencies
- Python environment with required packages installed
- Access to external API services (OpenAI, Anthropic, etc.)
- Network connectivity for API validation
- Database access permissions

### Potential Blockers
- API key acquisition delays from external services
- Network restrictions preventing API access
- Database permission issues
- Configuration conflicts with existing system

### Risk Mitigation
- Provide mock/demo API keys for initial testing
- Implement offline development mode
- Create automated environment setup scripts
- Document troubleshooting steps for common issues

---

## Related Stories
- **DASH-001**: Dashboard Configuration (depends on ENV-001)
- **AI-001**: AI Service Integration (depends on ENV-001)  
- **DATA-001**: Data Pipeline Setup (depends on ENV-001)
- **SOCIAL-001**: Social Media Integration (depends on ENV-001)

---

## Notes for AI Developer Agents
- Extend the existing configuration system rather than replacing it
- Maintain backward compatibility with current `.env` structure
- Use type hints and dataclasses for configuration management
- Implement comprehensive error logging for debugging
- Create helper scripts for common environment setup tasks
- Follow existing code patterns in the `/Users/srijan/ai-finance-agency/config/` directory

---

**Story Created**: 2025-09-09  
**Last Updated**: 2025-09-09  
**Created By**: Bob the Scrum Master  
**Assigned To**: Available for pickup by AI developer agents