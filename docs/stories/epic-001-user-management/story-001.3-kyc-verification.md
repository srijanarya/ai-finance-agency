# Epic 001: User Management & Authentication
## Story 001.3: KYC Verification System

---

### Story ID: TREUM-001.3
**Epic**: 001 - User Management & Authentication  
**Sprint**: 2  
**Priority**: P0 - CRITICAL  
**Points**: 13  
**Type**: Feature  
**Component**: KYC Service  
**Dependencies**: Story 001.1 (JWT Authentication)

---

## User Story
**AS A** user wanting to trade and make payments  
**I WANT** to complete KYC verification  
**SO THAT** I can access trading features and make high-value transactions per Indian regulations  

---

## Acceptance Criteria

### Functional Requirements
- [ ] Support PAN card verification
- [ ] Support Aadhaar card verification  
- [ ] Selfie verification with liveness detection
- [ ] Address proof upload and verification
- [ ] Income proof verification (optional for basic tier)
- [ ] Automatic risk scoring (0-100)
- [ ] Three KYC tiers:
  - **Basic**: ₹50K transaction limit, PAN + Aadhaar
  - **Intermediate**: ₹5L transaction limit, + Address proof
  - **Advanced**: Unlimited, + Income proof + Video KYC
- [ ] Real-time verification via Digilocker integration
- [ ] Manual review queue for edge cases
- [ ] KYC status updates via notifications

### Business Rules
- [ ] PAN verification mandatory for all tiers
- [ ] Aadhaar verification required per RBI guidelines
- [ ] Address proof <6 months old
- [ ] Income proof <3 months old  
- [ ] Video KYC for transactions >₹2L
- [ ] Re-verification every 2 years
- [ ] Instant approval for 80% of cases
- [ ] Manual review SLA: 24 hours

### Compliance Requirements
- [ ] PMLA (Prevention of Money Laundering Act) compliance
- [ ] RBI KYC guidelines adherence
- [ ] Data Protection Act compliance
- [ ] PII encryption at rest
- [ ] Audit trail for all KYC activities
- [ ] Document retention for 10 years
- [ ] AML screening integration

### Technical Requirements
- [ ] Document OCR with 95% accuracy
- [ ] Liveness detection for selfies
- [ ] Aadhaar OTP verification
- [ ] PAN verification via NSDL
- [ ] Digilocker integration
- [ ] Face matching with 98% accuracy
- [ ] Processing time <2 minutes for auto-approval

---

## Technical Implementation

### API Endpoints
```typescript
POST /api/v1/kyc/initiate
POST /api/v1/kyc/upload-document
POST /api/v1/kyc/verify-pan
POST /api/v1/kyc/verify-aadhaar
POST /api/v1/kyc/upload-selfie
POST /api/v1/kyc/submit-for-review
GET  /api/v1/kyc/status
GET  /api/v1/kyc/documents/{documentId}
PUT  /api/v1/kyc/update-status
POST /api/v1/kyc/manual-review
```

### Database Schema
```sql
-- KYC applications
CREATE TABLE kyc_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tier_requested VARCHAR(20) NOT NULL, -- 'basic', 'intermediate', 'advanced'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_review', 'approved', 'rejected', 'expired'
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    reviewer_id UUID,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Document uploads
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES kyc_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'pan', 'aadhaar_front', 'aadhaar_back', 'address_proof', 'income_proof', 'selfie'
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64),
    ocr_data JSONB,
    verification_status VARCHAR(20) DEFAULT 'pending',
    verification_confidence DECIMAL(5,2),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- KYC verification results
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES kyc_applications(id),
    verification_type VARCHAR(50), -- 'pan', 'aadhaar', 'face_match', 'address', 'income'
    provider VARCHAR(50), -- 'nsdl', 'uidai', 'digilocker', 'manual'
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(20), -- 'success', 'failed', 'pending'
    confidence_score DECIMAL(5,2),
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AML screening results
CREATE TABLE aml_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES kyc_applications(id),
    screening_provider VARCHAR(50),
    name_searched VARCHAR(255),
    matches_found INTEGER DEFAULT 0,
    risk_level VARCHAR(20), -- 'low', 'medium', 'high'
    screening_data JSONB,
    screened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Request/Response Examples

#### Initiate KYC Request
```json
POST /api/v1/kyc/initiate
{
  "tier": "intermediate",
  "personalInfo": {
    "fullName": "Raj Kumar Sharma",
    "dateOfBirth": "1990-01-15",
    "fatherName": "Suresh Kumar Sharma",
    "address": {
      "line1": "123, MG Road",
      "line2": "Near City Mall",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }
}
```

#### Upload Document Request
```json
POST /api/v1/kyc/upload-document
Content-Type: multipart/form-data
{
  "documentType": "pan",
  "file": [binary data],
  "applicationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Document Upload Response
```json
{
  "success": true,
  "data": {
    "documentId": "123e4567-e89b-12d3-a456-426614174000",
    "ocrData": {
      "panNumber": "ABCDE1234F",
      "name": "RAJ KUMAR SHARMA",
      "fatherName": "SURESH KUMAR SHARMA",
      "dateOfBirth": "15/01/1990"
    },
    "verificationStatus": "success",
    "confidence": 98.5
  }
}
```

#### KYC Status Response
```json
{
  "success": true,
  "data": {
    "applicationId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "approved",
    "tier": "intermediate",
    "riskScore": 15,
    "submittedAt": "2024-01-15T10:30:00Z",
    "approvedAt": "2024-01-15T11:45:00Z",
    "expiresAt": "2026-01-15T11:45:00Z",
    "documents": [
      {
        "type": "pan",
        "status": "verified",
        "confidence": 98.5
      },
      {
        "type": "aadhaar",
        "status": "verified", 
        "confidence": 96.2
      },
      {
        "type": "address_proof",
        "status": "verified",
        "confidence": 94.8
      }
    ],
    "nextSteps": [],
    "transactionLimits": {
      "daily": 500000,
      "monthly": 2000000,
      "yearly": 5000000
    }
  }
}
```

---

## Implementation Tasks

### Backend Tasks
1. **Set up KYC service** (3 hours)
   ```bash
   nest g module kyc
   nest g controller kyc
   nest g service kyc
   nest g service aml-screening
   ```

2. **Install OCR and ML packages** (1 hour)
   ```bash
   npm install tesseract.js face-api.js sharp
   npm install aws-sdk @google-cloud/vision
   ```

3. **Implement document verification** (4 hours)
   - PAN verification via NSDL API
   - Aadhaar verification via UIDAI
   - OCR processing for documents
   - Document authenticity checks

4. **Create face verification** (3 hours)
   - Selfie liveness detection
   - Face matching with ID photos
   - Anti-spoofing measures

5. **Implement AML screening** (2 hours)
   - Name matching algorithms
   - Sanctions list checking
   - PEP (Politically Exposed Person) screening
   - Risk scoring algorithm

6. **Build manual review system** (2 hours)
   - Review queue management
   - Admin dashboard for reviewers
   - Approval/rejection workflow

### Frontend Tasks
1. **KYC onboarding flow** (4 hours)
   - Step-by-step wizard
   - Document upload with preview
   - Camera integration for selfies
   - Progress tracking

2. **Document capture UI** (2 hours)
   - Camera with guidelines
   - Image quality validation
   - Retake functionality
   - Upload progress

3. **KYC status dashboard** (2 hours)
   - Application status
   - Document verification status
   - Next steps guidance
   - Transaction limits display

### Integration Tasks
1. **Digilocker integration** (2 hours)
   - OAuth flow
   - Document fetching
   - Verification API calls

2. **Third-party API setup** (1 hour)
   - NSDL PAN verification
   - SMS OTP for Aadhaar
   - OCR service configuration

### Testing Tasks
1. **Unit tests** (2 hours)
   - Document verification logic
   - Risk scoring algorithm
   - Face matching accuracy

2. **Integration tests** (2 hours)
   - Full KYC flow
   - API integrations
   - File upload handling

3. **E2E tests** (1 hour)
   - Complete user journey
   - Different KYC tiers
   - Edge cases

---

## Definition of Done

### Code Quality
- [ ] OCR accuracy >95%
- [ ] Face matching accuracy >98%
- [ ] All edge cases handled
- [ ] Security review passed

### Compliance
- [ ] Legal review completed
- [ ] Data privacy audit passed
- [ ] Retention policies implemented
- [ ] Audit logs comprehensive

### Performance
- [ ] Auto-approval <2 minutes
- [ ] File upload <30 seconds
- [ ] API response <500ms
- [ ] Load tested for 1000 concurrent KYC

### Security
- [ ] PII encrypted
- [ ] Secure file storage
- [ ] Access controls verified
- [ ] No data leakage

---

## Risk Mitigation

### Technical Risks
- OCR accuracy issues → Manual fallback + training data
- API integration failures → Circuit breakers + retries
- Face matching false positives → Adjustable thresholds

### Compliance Risks
- Regulatory changes → Legal consultation + flexible architecture
- Data breaches → Encryption + audit trails + incident response

### Business Risks
- High rejection rates → Better user guidance + support
- Slow processing → Capacity planning + automation

---

## Notes
- Video KYC implementation in future sprint
- Integration with credit bureau for advanced verification
- Blockchain-based KYC sharing with other platforms
- AI model training for better fraud detection

---

## Estimation Breakdown
- Development: 22 hours
- Testing: 5 hours
- Integration: 3 hours
- Documentation: 2 hours
- Code Review: 3 hours
- **Total: 35 hours (13 story points)**