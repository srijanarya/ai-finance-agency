# KYC System Test Suite Documentation

## Overview
Comprehensive test suite for the User Profile Management and KYC Verification System (Story 002.1).

## Test Coverage

### 1. Model Tests (`test_profile_models.py`)
Tests database models and business logic.

#### UserProfile Tests
- ✅ Profile creation and validation
- ✅ Profile completion percentage calculation
- ✅ Profile completion status updates
- ✅ Required field validation

#### KYCDocument Tests
- ✅ Document creation with encryption
- ✅ Document verification workflow
- ✅ Document expiry detection
- ✅ Soft deletion functionality
- ✅ Document validity checks

#### KYCStatus Tests
- ✅ Status creation and initialization
- ✅ Risk score calculation (0-100 scale)
- ✅ Overall status updates (PENDING → UNDER_REVIEW → VERIFIED)
- ✅ Transaction limit calculation based on risk
- ✅ Video KYC bonus application

#### AddressVerification Tests
- ✅ Address creation and validation
- ✅ Multiple address support (current/permanent)
- ✅ Pin code validation
- ✅ Verification method tracking

### 2. Service Tests (`test_kyc_services.py`)

#### FileUploadService Tests
- ✅ File validation (type, size, content)
- ✅ Malware scanning
- ✅ File encryption/decryption (AES-256)
- ✅ SHA-256 hash calculation
- ✅ Secure filename generation
- ✅ Encrypted file storage
- ✅ File retrieval and decryption
- ✅ Secure file deletion with overwriting
- ✅ Thumbnail creation for images
- ✅ Watermark application

#### KYCVerificationService Tests
- ✅ PAN card verification (mock NSDL)
- ✅ Aadhaar verification (mock DigiLocker)
- ✅ Bank account verification
- ✅ Address verification
- ✅ Risk score calculation with factors
- ✅ Transaction limit setting by risk level
- ✅ Video KYC verification
- ✅ Fuzzy name matching
- ✅ IFSC to bank name mapping
- ✅ Pin code to state mapping

### 3. API Integration Tests (`test_profile_api.py`)

#### Profile Endpoints
- ✅ GET /api/v1/users/profile - Get user profile
- ✅ PUT /api/v1/users/profile - Update profile
- ✅ Profile creation for new users
- ✅ Data validation and sanitization
- ✅ PII masking in responses

#### KYC Document Endpoints
- ✅ POST /api/v1/users/kyc/documents - Upload document
- ✅ GET /api/v1/users/kyc/documents - List documents
- ✅ GET /api/v1/users/kyc/documents/{id}/download - Download document
- ✅ DELETE /api/v1/users/kyc/documents/{id} - Delete document
- ✅ File type validation
- ✅ Document replacement logic

#### KYC Status Endpoints
- ✅ GET /api/v1/users/kyc/status - Get verification status
- ✅ POST /api/v1/users/kyc/verify - Trigger verification
- ✅ Risk assessment
- ✅ Transaction limit calculation

#### Security Tests
- ✅ Authentication requirement
- ✅ User isolation (can't access others' documents)
- ✅ Watermarking on download
- ✅ Data masking in responses

## Running the Tests

### Run All Tests
```bash
pytest tests/test_profile_models.py tests/test_kyc_services.py tests/test_profile_api.py -v
```

### Run Specific Test Categories
```bash
# Model tests only
pytest tests/test_profile_models.py -v

# Service tests only
pytest tests/test_kyc_services.py -v

# API tests only
pytest tests/test_profile_api.py -v
```

### Run with Coverage
```bash
pytest tests/test_profile_*.py tests/test_kyc_*.py --cov=app --cov=database/models
```

### Run Specific Test Class
```bash
pytest tests/test_profile_models.py::TestUserProfile -v
```

### Run Specific Test Method
```bash
pytest tests/test_profile_models.py::TestUserProfile::test_profile_completion_calculation -v
```

## Test Dependencies

Required packages:
```bash
pip install pytest pytest-asyncio pytest-mock Pillow python-magic cryptography
```

## Test Database

Tests use SQLite in-memory database for isolation:
- Model tests: `sqlite:///:memory:`
- API tests: `sqlite:///./test.db`

## Mock External Services

The following external services are mocked:
- **NSDL PAN Verification**: 90% success rate mock
- **DigiLocker Aadhaar**: 85% success rate mock
- **Bank Account Verification**: 90% success rate mock
- **Address Verification**: 95% success rate mock
- **Video KYC**: 80% success rate mock

## Security Testing Coverage

### Encryption
- ✅ AES-256 encryption for documents
- ✅ Key rotation support
- ✅ Secure key storage

### Data Protection
- ✅ PII masking (PAN, Aadhaar, Bank Account)
- ✅ Watermarking for audit trails
- ✅ Secure file deletion

### Access Control
- ✅ User isolation
- ✅ Authentication requirements
- ✅ Authorization checks

## Performance Considerations

### Tested Scenarios
- Large file uploads (up to 10MB)
- Multiple concurrent document uploads
- Risk calculation with multiple factors
- Profile completion with all fields

### Optimization Areas Tested
- Database indexing effectiveness
- File encryption/decryption speed
- Thumbnail generation efficiency

## Compliance Testing

### RBI KYC Norms
- ✅ Document type requirements
- ✅ Verification workflow
- ✅ Risk-based approach

### Data Protection
- ✅ Encryption at rest
- ✅ PII handling
- ✅ Audit trail generation

## Test Metrics

- **Total Test Cases**: 65+
- **Model Tests**: 15
- **Service Tests**: 25
- **API Tests**: 25
- **Security Tests**: 10+
- **Code Coverage Target**: 80%+

## Continuous Integration

Add to CI/CD pipeline:
```yaml
test:
  script:
    - pip install -r requirements.txt
    - pip install pytest pytest-asyncio pytest-mock
    - pytest tests/test_profile_*.py tests/test_kyc_*.py -v --junitxml=report.xml
  artifacts:
    reports:
      junit: report.xml
```

## Future Test Enhancements

1. **Load Testing**: Add performance tests with locust/jmeter
2. **Integration Tests**: Test with real external APIs (staging)
3. **Penetration Testing**: Security vulnerability scanning
4. **Compliance Validation**: Automated regulatory checks
5. **End-to-End Tests**: Full user journey testing

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure PYTHONPATH includes project root
2. **Database Errors**: Check SQLAlchemy version compatibility
3. **File Permission Errors**: Ensure test has write permissions
4. **Async Test Failures**: Use `pytest-asyncio` markers

### Debug Mode
```bash
pytest tests/test_profile_models.py -v -s --tb=short
```

## Contact

For test-related issues or improvements, please update this documentation.