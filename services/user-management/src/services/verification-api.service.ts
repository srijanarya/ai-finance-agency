/**
 * Verification API Service
 * Integrates with external verification services for PAN, Aadhaar, Bank, and Address verification
 * Handles OCR, document processing, and video KYC services
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createReadStream } from 'fs';
import FormData from 'form-data';

export interface PANVerificationRequest {
  panNumber: string;
  fullName: string;
  dateOfBirth?: string;
}

export interface PANVerificationResponse {
  verified: boolean;
  panNumber?: string;
  fullName?: string;
  verificationId: string;
  confidenceScore: number;
  checksPerformed: string[];
  externalVerificationId: string;
  error?: string;
}

export interface AadhaarVerificationRequest {
  aadhaarNumber: string;
  fullName: string;
  dateOfBirth?: string;
  digilockerReference?: string;
}

export interface AadhaarVerificationResponse {
  verified: boolean;
  aadhaarNumber?: string;
  fullName?: string;
  verificationId: string;
  digilockerReference?: string;
  confidenceScore: number;
  checksPerformed: string[];
  externalVerificationId: string;
  error?: string;
}

export interface BankVerificationRequest {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface BankVerificationResponse {
  verified: boolean;
  accountNumber?: string;
  bankName?: string;
  verificationId: string;
  confidenceScore: number;
  checksPerformed: string[];
  externalVerificationId: string;
  error?: string;
}

export interface AddressVerificationRequest {
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  verificationMethod: string;
}

export interface AddressVerificationResponse {
  verified: boolean;
  pinCode?: string;
  verificationId: string;
  details?: any;
  confidenceScore: number;
  checksPerformed: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  error?: string;
}

export interface VideoKYCSessionRequest {
  userId: string;
  sessionType: string;
  preferredLanguage?: string;
  preferredTimeSlot?: string;
  specialInstructions?: string;
}

export interface VideoKYCSessionResponse {
  sessionId: string;
  sessionUrl: string;
  expiresAt: string;
  instructions: string;
  scheduledAt?: string;
}

export interface OCRExtractionResult {
  success: boolean;
  extractedData: Record<string, any>;
  confidence: number;
  error?: string;
}

export interface DocumentQualityResult {
  success: boolean;
  imageQuality: number;
  blurDetection: number;
  brightness: number;
  contrast: number;
  error?: string;
}

/**
 * Service for integrating with external verification APIs
 */
@Injectable()
export class VerificationAPIService {
  private readonly logger = new Logger(VerificationAPIService.name);

  private readonly panVerificationUrl: string;
  private readonly aadhaarVerificationUrl: string;
  private readonly bankVerificationUrl: string;
  private readonly addressVerificationUrl: string;
  private readonly ocrServiceUrl: string;
  private readonly videoKYCServiceUrl: string;
  private readonly qualityAssessmentUrl: string;

  private readonly apiKeys: {
    pan: string;
    aadhaar: string;
    bank: string;
    address: string;
    ocr: string;
    videoKYC: string;
    quality: string;
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.panVerificationUrl = this.configService.get<string>(
      'PAN_VERIFICATION_URL',
      '',
    );
    this.aadhaarVerificationUrl = this.configService.get<string>(
      'AADHAAR_VERIFICATION_URL',
      '',
    );
    this.bankVerificationUrl = this.configService.get<string>(
      'BANK_VERIFICATION_URL',
      '',
    );
    this.addressVerificationUrl = this.configService.get<string>(
      'ADDRESS_VERIFICATION_URL',
      '',
    );
    this.ocrServiceUrl = this.configService.get<string>('OCR_SERVICE_URL', '');
    this.videoKYCServiceUrl = this.configService.get<string>(
      'VIDEO_KYC_SERVICE_URL',
      '',
    );
    this.qualityAssessmentUrl = this.configService.get<string>(
      'QUALITY_ASSESSMENT_URL',
      '',
    );

    this.apiKeys = {
      pan: this.configService.get<string>('PAN_API_KEY', ''),
      aadhaar: this.configService.get<string>('AADHAAR_API_KEY', ''),
      bank: this.configService.get<string>('BANK_API_KEY', ''),
      address: this.configService.get<string>('ADDRESS_API_KEY', ''),
      ocr: this.configService.get<string>('OCR_API_KEY', ''),
      videoKYC: this.configService.get<string>('VIDEO_KYC_API_KEY', ''),
      quality: this.configService.get<string>('QUALITY_API_KEY', ''),
    };
  }

  /**
   * Verify PAN card with government database
   */
  async verifyPAN(
    request: PANVerificationRequest,
  ): Promise<PANVerificationResponse> {
    this.logger.log(`Verifying PAN: ${request.panNumber.substring(0, 5)}XXXX`);

    try {
      // Mock implementation - replace with actual API call
      if (this.configService.get('NODE_ENV') === 'development') {
        return this.mockPANVerification(request);
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.panVerificationUrl}/verify`,
          {
            pan_number: request.panNumber,
            full_name: request.fullName,
            date_of_birth: request.dateOfBirth,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKeys.pan}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const data = response.data;

      return {
        verified: data.status === 'valid',
        panNumber: data.verified ? request.panNumber : undefined,
        fullName: data.name_match ? request.fullName : undefined,
        verificationId: data.verification_id,
        confidenceScore: data.confidence_score || 0,
        checksPerformed: data.checks_performed || [
          'pan_format',
          'name_match',
          'database_lookup',
        ],
        externalVerificationId: data.external_id,
        error: data.status !== 'valid' ? data.error_message : undefined,
      };
    } catch (error) {
      this.logger.error(`PAN verification failed:`, error);
      return {
        verified: false,
        verificationId: `ERROR_${Date.now()}`,
        confidenceScore: 0,
        checksPerformed: ['api_call'],
        externalVerificationId: '',
        error: error.message || 'PAN verification service unavailable',
      };
    }
  }

  /**
   * Verify Aadhaar with UIDAI
   */
  async verifyAadhaar(
    request: AadhaarVerificationRequest,
  ): Promise<AadhaarVerificationResponse> {
    this.logger.log(
      `Verifying Aadhaar: XXXX-XXXX-${request.aadhaarNumber.slice(-4)}`,
    );

    try {
      // Mock implementation - replace with actual API call
      if (this.configService.get('NODE_ENV') === 'development') {
        return this.mockAadhaarVerification(request);
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.aadhaarVerificationUrl}/verify`,
          {
            aadhaar_number: request.aadhaarNumber,
            full_name: request.fullName,
            date_of_birth: request.dateOfBirth,
            digilocker_reference: request.digilockerReference,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKeys.aadhaar}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const data = response.data;

      return {
        verified: data.status === 'valid',
        aadhaarNumber: data.verified
          ? `XXXX-XXXX-${request.aadhaarNumber.slice(-4)}`
          : undefined,
        fullName: data.name_match ? request.fullName : undefined,
        verificationId: data.verification_id,
        digilockerReference: data.digilocker_reference,
        confidenceScore: data.confidence_score || 0,
        checksPerformed: data.checks_performed || [
          'aadhaar_format',
          'name_match',
          'uidai_lookup',
        ],
        externalVerificationId: data.external_id,
        error: data.status !== 'valid' ? data.error_message : undefined,
      };
    } catch (error) {
      this.logger.error(`Aadhaar verification failed:`, error);
      return {
        verified: false,
        verificationId: `ERROR_${Date.now()}`,
        confidenceScore: 0,
        checksPerformed: ['api_call'],
        externalVerificationId: '',
        error: error.message || 'Aadhaar verification service unavailable',
      };
    }
  }

  /**
   * Verify bank account details
   */
  async verifyBankAccount(
    request: BankVerificationRequest,
  ): Promise<BankVerificationResponse> {
    this.logger.log(
      `Verifying bank account: XXXXXXXX${request.accountNumber.slice(-4)}`,
    );

    try {
      // Mock implementation - replace with actual API call
      if (this.configService.get('NODE_ENV') === 'development') {
        return this.mockBankVerification(request);
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.bankVerificationUrl}/verify`,
          {
            account_number: request.accountNumber,
            ifsc_code: request.ifscCode,
            account_holder_name: request.accountHolderName,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKeys.bank}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const data = response.data;

      return {
        verified: data.status === 'valid',
        accountNumber: data.verified
          ? `XXXXXXXX${request.accountNumber.slice(-4)}`
          : undefined,
        bankName: data.bank_name,
        verificationId: data.verification_id,
        confidenceScore: data.confidence_score || 0,
        checksPerformed: data.checks_performed || [
          'ifsc_validation',
          'account_existence',
          'name_match',
        ],
        externalVerificationId: data.external_id,
        error: data.status !== 'valid' ? data.error_message : undefined,
      };
    } catch (error) {
      this.logger.error(`Bank verification failed:`, error);
      return {
        verified: false,
        verificationId: `ERROR_${Date.now()}`,
        confidenceScore: 0,
        checksPerformed: ['api_call'],
        externalVerificationId: '',
        error: error.message || 'Bank verification service unavailable',
      };
    }
  }

  /**
   * Verify address with multiple data sources
   */
  async verifyAddress(
    request: AddressVerificationRequest,
  ): Promise<AddressVerificationResponse> {
    this.logger.log(`Verifying address: ${request.pinCode}`);

    try {
      // Mock implementation - replace with actual API call
      if (this.configService.get('NODE_ENV') === 'development') {
        return this.mockAddressVerification(request);
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.addressVerificationUrl}/verify`,
          {
            address: request.address,
            city: request.city,
            state: request.state,
            pin_code: request.pinCode,
            country: request.country,
            verification_method: request.verificationMethod,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKeys.address}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const data = response.data;

      return {
        verified: data.status === 'valid',
        pinCode: data.verified ? request.pinCode : undefined,
        verificationId: data.verification_id,
        details: data.address_details,
        confidenceScore: data.confidence_score || 0,
        checksPerformed: data.checks_performed || [
          'postal_validation',
          'geocoding',
          'address_standardization',
        ],
        coordinates: data.coordinates
          ? {
              latitude: data.coordinates.lat,
              longitude: data.coordinates.lng,
              accuracy: data.coordinates.accuracy,
            }
          : undefined,
        error: data.status !== 'valid' ? data.error_message : undefined,
      };
    } catch (error) {
      this.logger.error(`Address verification failed:`, error);
      return {
        verified: false,
        verificationId: `ERROR_${Date.now()}`,
        confidenceScore: 0,
        checksPerformed: ['api_call'],
        error: error.message || 'Address verification service unavailable',
      };
    }
  }

  /**
   * Create video KYC session
   */
  async createVideoKYCSession(
    request: VideoKYCSessionRequest,
  ): Promise<VideoKYCSessionResponse> {
    this.logger.log(`Creating video KYC session for user: ${request.userId}`);

    try {
      // Mock implementation - replace with actual API call
      if (this.configService.get('NODE_ENV') === 'development') {
        return this.mockVideoKYCSession(request);
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.videoKYCServiceUrl}/sessions`,
          {
            user_id: request.userId,
            session_type: request.sessionType,
            preferred_language: request.preferredLanguage,
            preferred_time_slot: request.preferredTimeSlot,
            special_instructions: request.specialInstructions,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKeys.videoKYC}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const data = response.data;

      return {
        sessionId: data.session_id,
        sessionUrl: data.session_url,
        expiresAt: data.expires_at,
        instructions: data.instructions,
        scheduledAt: data.scheduled_at,
      };
    } catch (error) {
      this.logger.error(`Video KYC session creation failed:`, error);
      throw new Error(`Video KYC session creation failed: ${error.message}`);
    }
  }

  /**
   * Extract data from document using OCR
   */
  async extractDocumentData(
    filePath: string,
    documentType: string,
  ): Promise<OCRExtractionResult> {
    this.logger.log(`Extracting data from ${documentType} document`);

    try {
      // Mock implementation - replace with actual API call
      if (this.configService.get('NODE_ENV') === 'development') {
        return this.mockOCRExtraction(documentType);
      }

      const formData = new FormData();
      formData.append('file', createReadStream(filePath));
      formData.append('document_type', documentType);

      const response = await firstValueFrom(
        this.httpService.post(`${this.ocrServiceUrl}/extract`, formData, {
          headers: {
            Authorization: `Bearer ${this.apiKeys.ocr}`,
            ...formData.getHeaders(),
          },
          timeout: 60000,
        }),
      );

      const data = response.data;

      return {
        success: data.success,
        extractedData: data.extracted_data,
        confidence: data.confidence,
        error: data.success ? undefined : data.error,
      };
    } catch (error) {
      this.logger.error(`OCR extraction failed:`, error);
      return {
        success: false,
        extractedData: {},
        confidence: 0,
        error: error.message || 'OCR service unavailable',
      };
    }
  }

  /**
   * Assess document quality
   */
  async assessDocumentQuality(
    filePath: string,
  ): Promise<DocumentQualityResult> {
    this.logger.log(`Assessing document quality`);

    try {
      // Mock implementation - replace with actual API call
      if (this.configService.get('NODE_ENV') === 'development') {
        return this.mockQualityAssessment();
      }

      const formData = new FormData();
      formData.append('file', createReadStream(filePath));

      const response = await firstValueFrom(
        this.httpService.post(`${this.qualityAssessmentUrl}/assess`, formData, {
          headers: {
            Authorization: `Bearer ${this.apiKeys.quality}`,
            ...formData.getHeaders(),
          },
          timeout: 60000,
        }),
      );

      const data = response.data;

      return {
        success: data.success,
        imageQuality: data.image_quality,
        blurDetection: data.blur_detection,
        brightness: data.brightness,
        contrast: data.contrast,
        error: data.success ? undefined : data.error,
      };
    } catch (error) {
      this.logger.error(`Quality assessment failed:`, error);
      return {
        success: false,
        imageQuality: 0,
        blurDetection: 0,
        brightness: 0,
        contrast: 0,
        error: error.message || 'Quality assessment service unavailable',
      };
    }
  }

  // Mock implementations for development

  private mockPANVerification(
    request: PANVerificationRequest,
  ): PANVerificationResponse {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const isValidFormat = panRegex.test(request.panNumber);

    const verified = isValidFormat && request.fullName.length > 2;

    return {
      verified,
      panNumber: verified ? request.panNumber : undefined,
      fullName: verified ? request.fullName : undefined,
      verificationId: `PAN_MOCK_${Date.now()}`,
      confidenceScore: verified ? 95 : 0,
      checksPerformed: [
        'pan_format',
        'name_validation',
        'mock_database_lookup',
      ],
      externalVerificationId: `MOCK_PAN_${Math.random().toString(36).substr(2, 9)}`,
      error: verified ? undefined : 'Invalid PAN format or name',
    };
  }

  private mockAadhaarVerification(
    request: AadhaarVerificationRequest,
  ): AadhaarVerificationResponse {
    const aadhaarRegex = /^[0-9]{12}$/;
    const isValidFormat = aadhaarRegex.test(request.aadhaarNumber);

    const verified = isValidFormat && request.fullName.length > 2;

    return {
      verified,
      aadhaarNumber: verified
        ? `XXXX-XXXX-${request.aadhaarNumber.slice(-4)}`
        : undefined,
      fullName: verified ? request.fullName : undefined,
      verificationId: `AADHAAR_MOCK_${Date.now()}`,
      digilockerReference: request.digilockerReference,
      confidenceScore: verified ? 92 : 0,
      checksPerformed: [
        'aadhaar_format',
        'name_validation',
        'mock_uidai_lookup',
      ],
      externalVerificationId: `MOCK_AADHAAR_${Math.random().toString(36).substr(2, 9)}`,
      error: verified ? undefined : 'Invalid Aadhaar format or name',
    };
  }

  private mockBankVerification(
    request: BankVerificationRequest,
  ): BankVerificationResponse {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const isValidIFSC = ifscRegex.test(request.ifscCode);

    const verified =
      isValidIFSC &&
      request.accountNumber.length >= 8 &&
      request.accountHolderName.length > 2;

    const bankName = this.getBankNameFromIFSC(request.ifscCode);

    return {
      verified,
      accountNumber: verified
        ? `XXXXXXXX${request.accountNumber.slice(-4)}`
        : undefined,
      bankName: verified ? bankName : undefined,
      verificationId: `BANK_MOCK_${Date.now()}`,
      confidenceScore: verified ? 88 : 0,
      checksPerformed: [
        'ifsc_validation',
        'account_format',
        'mock_bank_lookup',
      ],
      externalVerificationId: `MOCK_BANK_${Math.random().toString(36).substr(2, 9)}`,
      error: verified ? undefined : 'Invalid bank details',
    };
  }

  private mockAddressVerification(
    request: AddressVerificationRequest,
  ): AddressVerificationResponse {
    const pinCodeRegex = /^[0-9]{6}$/;
    const isValidPinCode = pinCodeRegex.test(request.pinCode);

    const verified =
      isValidPinCode && request.address.length > 10 && request.city.length > 2;

    return {
      verified,
      pinCode: verified ? request.pinCode : undefined,
      verificationId: `ADDRESS_MOCK_${Date.now()}`,
      details: verified
        ? {
            standardized_address: `${request.address}, ${request.city}, ${request.state} - ${request.pinCode}`,
            postal_circle: 'Karnataka',
            delivery_status: 'Delivery',
          }
        : undefined,
      confidenceScore: verified ? 85 : 0,
      checksPerformed: [
        'pin_code_validation',
        'address_standardization',
        'mock_postal_lookup',
      ],
      coordinates: verified
        ? {
            latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
            longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
            accuracy: 50,
          }
        : undefined,
      error: verified ? undefined : 'Invalid address format',
    };
  }

  private mockVideoKYCSession(
    request: VideoKYCSessionRequest,
  ): VideoKYCSessionResponse {
    const sessionId = `VKYC_MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    return {
      sessionId,
      sessionUrl: `https://mock-video-kyc.example.com/session/${sessionId}`,
      expiresAt,
      instructions:
        'Please ensure good lighting, have your documents ready, and be in a quiet environment.',
      scheduledAt: request.preferredTimeSlot,
    };
  }

  private mockOCRExtraction(documentType: string): OCRExtractionResult {
    const mockData: Record<string, any> = {
      PAN: {
        name: 'JOHN DOE',
        panNumber: 'ABCDE1234F',
        fatherName: 'RICHARD DOE',
        dateOfBirth: '01/01/1990',
      },
      AADHAAR: {
        name: 'John Doe',
        aadhaarNumber: '1234 5678 9012',
        dateOfBirth: '01/01/1990',
        gender: 'Male',
        address: '123 Main Street, Bangalore, Karnataka - 560001',
      },
      BANK_STATEMENT: {
        accountNumber: '1234567890',
        accountHolderName: 'JOHN DOE',
        bankName: 'HDFC BANK',
        ifscCode: 'HDFC0001234',
        statementPeriod: '01/01/2024 to 31/01/2024',
      },
    };

    return {
      success: true,
      extractedData: mockData[documentType] || {},
      confidence: 90 + Math.random() * 10,
    };
  }

  private mockQualityAssessment(): DocumentQualityResult {
    return {
      success: true,
      imageQuality: 80 + Math.random() * 20,
      blurDetection: 85 + Math.random() * 15,
      brightness: 75 + Math.random() * 25,
      contrast: 80 + Math.random() * 20,
    };
  }

  private getBankNameFromIFSC(ifscCode: string): string {
    const bankMap: Record<string, string> = {
      HDFC: 'HDFC Bank',
      SBIN: 'State Bank of India',
      ICIC: 'ICICI Bank',
      AXIS: 'Axis Bank',
      KKBK: 'Kotak Mahindra Bank',
      YESB: 'Yes Bank',
      INDB: 'IndusInd Bank',
      FDRL: 'Federal Bank',
    };

    const bankCode = ifscCode.substring(0, 4);
    return bankMap[bankCode] || 'Unknown Bank';
  }
}
