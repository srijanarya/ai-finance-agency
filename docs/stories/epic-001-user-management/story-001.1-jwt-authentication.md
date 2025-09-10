# Epic 001: User Management & Authentication
## Story 001.1: JWT Authentication Implementation

---

### Story ID: TREUM-001.1
**Epic**: 001 - User Management & Authentication  
**Sprint**: 1  
**Priority**: P0 - CRITICAL  
**Points**: 8  
**Type**: Feature  
**Component**: Authentication Service  

---

## User Story
**AS A** user of the TREUM platform  
**I WANT** to securely authenticate using my email/phone and password  
**SO THAT** I can access my personalized dashboard and protected resources  

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can register with email OR phone number
- [ ] Email validation with regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- [ ] Phone validation for Indian numbers: `/^[+]91[6-9]\d{9}$/`
- [ ] Password minimum requirements:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter  
  - One number
  - One special character
- [ ] JWT tokens generated with RS256 algorithm
- [ ] Access token expires in 15 minutes
- [ ] Refresh token expires in 7 days
- [ ] Refresh token rotation on use
- [ ] Logout invalidates all tokens
- [ ] Password hashing using bcrypt (salt rounds: 12)

### Security Requirements
- [ ] Rate limiting: 5 login attempts per 15 minutes
- [ ] Account lockout after 10 failed attempts
- [ ] OTP verification for registration (email/SMS)
- [ ] JWT tokens include:
  - user_id
  - email/phone
  - roles[]
  - issued_at
  - expires_at
- [ ] Secure cookie storage for refresh token (httpOnly, secure, sameSite)
- [ ] CSRF token implementation
- [ ] Device fingerprinting for suspicious activity detection

### Technical Requirements
- [ ] Response time: <200ms for auth endpoints
- [ ] Database: PostgreSQL 17.6 users table
- [ ] Cache: Redis 7.4.1 for session management
- [ ] Concurrent users: Support 10,000 simultaneous logins
- [ ] API versioning: /api/v1/auth/*

---

## Technical Implementation

### API Endpoints
```typescript
POST /api/v1/auth/register
POST /api/v1/auth/verify-otp
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_fingerprint VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP table
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL, -- email or phone
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL, -- 'registration', 'password_reset'
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Request/Response Examples

#### Registration Request
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "confirmPassword": "SecureP@ss123"
}
```

#### Registration Response
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "otpSentTo": "user@example.com",
    "expiresIn": 600
  }
}
```

#### Login Request
```json
POST /api/v1/auth/login
{
  "identifier": "user@example.com",
  "password": "SecureP@ss123",
  "deviceFingerprint": "abc123xyz789"
}
```

#### Login Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 900,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "roles": ["user"]
    }
  }
}
```

---

## Implementation Tasks

### Backend Tasks
1. **Set up NestJS authentication module** (2 hours)
   ```bash
   nest g module auth
   nest g controller auth
   nest g service auth
   ```

2. **Install required packages** (30 mins)
   ```bash
   npm install @nestjs/jwt @nestjs/passport passport passport-jwt
   npm install bcrypt class-validator class-transformer
   npm install @types/bcrypt @types/passport-jwt -D
   ```

3. **Create DTOs with validation** (1 hour)
   - RegisterDto
   - LoginDto
   - VerifyOtpDto
   - RefreshTokenDto

4. **Implement JWT strategy** (2 hours)
   - RS256 key generation
   - JWT payload structure
   - Token validation

5. **Create auth service methods** (3 hours)
   - register()
   - verifyOtp()
   - login()
   - refreshToken()
   - logout()
   - validateUser()

6. **Add rate limiting** (1 hour)
   - Redis-based rate limiter
   - IP-based tracking

7. **Implement OTP service** (2 hours)
   - Generate 6-digit OTP
   - Send via email/SMS
   - Verify with expiry

### Database Tasks
1. **Run migrations** (30 mins)
   ```bash
   npx prisma migrate dev --name add_auth_tables
   ```

2. **Create indexes** (30 mins)
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_phone ON users(phone);
   CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
   ```

### Testing Tasks
1. **Unit tests** (2 hours)
   - Auth service methods
   - JWT validation
   - Password hashing

2. **Integration tests** (2 hours)
   - Full auth flow
   - Token refresh
   - Rate limiting

3. **E2E tests** (1 hour)
   - Registration → OTP → Login
   - Token expiry scenarios

---

## Definition of Done

### Code Quality
- [ ] Code follows TypeScript strict mode
- [ ] All functions have JSDoc comments
- [ ] No ESLint warnings or errors
- [ ] Test coverage >90%

### Security
- [ ] Security scan passed (npm audit)
- [ ] OWASP Top 10 checklist verified
- [ ] Penetration testing scenarios passed

### Documentation
- [ ] API documentation in Swagger
- [ ] README updated with auth flow
- [ ] Postman collection created

### Performance
- [ ] Load tested with 1000 concurrent users
- [ ] Response time <200ms at p99
- [ ] No memory leaks detected

### Deployment
- [ ] Environment variables configured
- [ ] Docker image built and tested
- [ ] Kubernetes manifests updated
- [ ] Health check endpoint working

---

## Dependencies
- **Blocked by**: Sprint 0 infrastructure setup
- **Blocks**: All other authenticated endpoints

---

## Notes
- Consider implementing social auth (Google, GitHub) in future sprint
- MFA/2FA will be implemented in Story 001.2
- KYC verification is separate Epic 001 Story 003

---

## Estimation Breakdown
- Development: 16 hours
- Testing: 5 hours  
- Documentation: 2 hours
- Code Review: 2 hours
- **Total: 25 hours (8 story points)**