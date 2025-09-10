# Epic 001: User Management & Authentication
## Story 001.2: Multi-Factor Authentication (MFA/2FA)

---

### Story ID: TREUM-001.2
**Epic**: 001 - User Management & Authentication  
**Sprint**: 1  
**Priority**: P0 - CRITICAL  
**Points**: 5  
**Type**: Feature  
**Component**: Authentication Service  
**Dependencies**: Story 001.1 (JWT Authentication)

---

## User Story
**AS A** security-conscious user  
**I WANT** to enable two-factor authentication on my account  
**SO THAT** my account has an additional layer of security beyond just password  

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can enable/disable 2FA from account settings
- [ ] Support for TOTP (Time-based One-Time Password)
- [ ] Support for SMS OTP as fallback
- [ ] QR code generation for authenticator apps
- [ ] Backup codes generation (10 codes)
- [ ] 2FA required for:
  - Login after password
  - High-value transactions (>₹50,000)
  - Account setting changes
  - API key generation
- [ ] Grace period of 30 seconds for TOTP
- [ ] Backup codes are single-use only
- [ ] User can regenerate backup codes

### Security Requirements
- [ ] Secret key encrypted in database
- [ ] QR code expires after 5 minutes
- [ ] Failed 2FA attempts limited to 3
- [ ] Account lockout after 5 consecutive 2FA failures
- [ ] Audit log for all 2FA events
- [ ] Secure delivery of SMS OTP
- [ ] No 2FA codes in logs

### Technical Requirements
- [ ] TOTP implementation per RFC 6238
- [ ] 6-digit codes with 30-second validity
- [ ] Compatible with Google Authenticator, Authy, etc.
- [ ] SMS fallback via Twilio/AWS SNS
- [ ] Response time <100ms for verification

---

## Technical Implementation

### API Endpoints
```typescript
POST /api/v1/auth/2fa/enable
POST /api/v1/auth/2fa/verify-setup
POST /api/v1/auth/2fa/disable
POST /api/v1/auth/2fa/verify
POST /api/v1/auth/2fa/backup-codes
POST /api/v1/auth/2fa/backup-codes/regenerate
POST /api/v1/auth/2fa/send-sms
GET  /api/v1/auth/2fa/status
```

### Database Schema
```sql
-- Two-factor authentication settings
CREATE TABLE two_factor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    secret VARCHAR(255) NOT NULL, -- Encrypted
    enabled BOOLEAN DEFAULT FALSE,
    enabled_at TIMESTAMP,
    backup_codes_generated_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Backup codes table
CREATE TABLE backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_backup_codes_user_id (user_id)
);

-- 2FA audit log
CREATE TABLE two_factor_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL, -- 'enabled', 'disabled', 'verified', 'failed'
    method VARCHAR(20), -- 'totp', 'sms', 'backup_code'
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_2fa_audit_user_id (user_id),
    INDEX idx_2fa_audit_created_at (created_at)
);
```

### Request/Response Examples

#### Enable 2FA Request
```json
POST /api/v1/auth/2fa/enable
Headers: {
  "Authorization": "Bearer {access_token}"
}
```

#### Enable 2FA Response
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP",
    "backupCodes": [
      "a3x7-9k2m-4p8q",
      "b5n2-3j7k-9m4x",
      "c8p4-2k9n-5j3m",
      "d2m8-4x3j-7n9k",
      "e9k3-8n2p-4m7x",
      "f4x7-3m9k-2n8j",
      "g7n2-9x4m-3k8p",
      "h3k8-2n7x-9m4j",
      "i8m4-7k3n-2x9p",
      "j2p9-4m8x-7n3k"
    ]
  }
}
```

#### Verify 2FA Setup Request
```json
POST /api/v1/auth/2fa/verify-setup
{
  "code": "123456"
}
```

#### Login with 2FA Request
```json
POST /api/v1/auth/2fa/verify
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "code": "123456",
  "method": "totp"
}
```

---

## Implementation Tasks

### Backend Tasks
1. **Install 2FA packages** (30 mins)
   ```bash
   npm install speakeasy qrcode
   npm install @types/speakeasy @types/qrcode -D
   ```

2. **Create 2FA service** (2 hours)
   ```typescript
   export class TwoFactorService {
     generateSecret(user: User): TwoFactorSecret
     generateQRCode(secret: string, user: User): Promise<string>
     verifyToken(secret: string, token: string): boolean
     generateBackupCodes(): string[]
     verifyBackupCode(userId: string, code: string): Promise<boolean>
   }
   ```

3. **Update auth flow** (2 hours)
   - Add 2FA check after password verification
   - Return 2FA required response
   - Handle 2FA verification

4. **Implement SMS fallback** (1.5 hours)
   - Twilio integration
   - SMS template
   - Rate limiting

5. **Create backup codes logic** (1 hour)
   - Generate unique codes
   - Hash for storage
   - Single-use validation

6. **Add audit logging** (1 hour)
   - Log all 2FA events
   - Include metadata
   - Retention policy

### Frontend Tasks
1. **2FA setup flow** (2 hours)
   - QR code display
   - Manual entry option
   - Backup codes display
   - Print/download backup codes

2. **2FA verification screen** (1 hour)
   - TOTP input
   - SMS request option
   - Backup code option

3. **Account settings UI** (1 hour)
   - Enable/disable toggle
   - Regenerate backup codes
   - View audit log

### Testing Tasks
1. **Unit tests** (1 hour)
   - TOTP generation/verification
   - Backup code validation
   - Time window testing

2. **Integration tests** (1 hour)
   - Full 2FA flow
   - SMS delivery
   - Backup code usage

3. **Security tests** (30 mins)
   - Brute force protection
   - Time-based attacks

---

## Definition of Done

### Code Quality
- [ ] All 2FA methods tested
- [ ] No security vulnerabilities
- [ ] Code review completed
- [ ] Documentation updated

### Security
- [ ] Secrets properly encrypted
- [ ] Audit trail complete
- [ ] Rate limiting effective
- [ ] No sensitive data in logs

### User Experience
- [ ] Clear setup instructions
- [ ] Backup codes downloadable
- [ ] Recovery process documented
- [ ] Error messages helpful

### Performance
- [ ] Verification <100ms
- [ ] QR code generation <500ms
- [ ] SMS delivery <5 seconds

---

## Edge Cases
- User loses phone with authenticator
- SMS delivery failures
- Time sync issues with TOTP
- Backup codes exhausted
- Account recovery without 2FA device

---

## Notes
- Consider hardware token support (YubiKey) in future
- Biometric authentication for mobile app later
- Admin override capability needed for support

---

## Estimation Breakdown
- Development: 11.5 hours
- Testing: 2.5 hours
- Documentation: 1 hour
- Code Review: 1 hour
- **Total: 16 hours (5 story points)**