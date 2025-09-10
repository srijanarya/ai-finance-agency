import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AddressVerification,
  VerificationStatus,
  VerificationProvider,
} from '../entities/address-verification.entity';
import { KYCApplication } from '../entities/kyc-application.entity';
import { firstValueFrom } from 'rxjs';

export interface AddressVerificationRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  country: string;
}

export interface AddressVerificationResponse {
  success: boolean;
  verificationId?: string;
  standardizedAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  geolocation?: {
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  deliverable: boolean;
  residential: boolean;
  commercial: boolean;
  vacant: boolean;
  confidenceScore: number;
  matchScore: number;
  qualityScore: number;
  error?: string;
}

export interface DocumentVerificationRequest {
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
  dateOfBirth?: string;
  firstName?: string;
  lastName?: string;
}

export interface DocumentVerificationResponse {
  success: boolean;
  valid: boolean;
  expired: boolean;
  extracted: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    documentNumber?: string;
    expiryDate?: string;
    nationality?: string;
  };
  confidenceScore: number;
  error?: string;
}

@Injectable()
export class VerificationAPIService {
  private readonly logger = new Logger(VerificationAPIService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(AddressVerification)
    private addressVerificationRepository: Repository<AddressVerification>,
  ) {}

  async verifyAddress(
    kycApplicationId: string,
    addressRequest: AddressVerificationRequest,
    provider: VerificationProvider = VerificationProvider.GOOGLE_MAPS,
  ): Promise<AddressVerification> {
    // Create address verification record
    const verification = this.addressVerificationRepository.create(
      AddressVerification.createFromKycApplication({
        id: kycApplicationId,
        ...addressRequest,
      } as KYCApplication),
    );

    verification.verificationProvider = provider;

    try {
      const response = await this.callVerificationAPI(provider, addressRequest);

      if (response.success) {
        this.populateVerificationFromResponse(verification, response);
        verification.status = VerificationStatus.VERIFIED;
      } else {
        verification.status = VerificationStatus.FAILED;
        verification.errorMessage = response.error || 'Verification failed';
      }
    } catch (error) {
      this.logger.error(
        `Address verification failed for application ${kycApplicationId}:`,
        error,
      );
      verification.status = VerificationStatus.FAILED;
      verification.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
    }

    return this.addressVerificationRepository.save(verification);
  }

  private async callVerificationAPI(
    provider: VerificationProvider,
    request: AddressVerificationRequest,
  ): Promise<AddressVerificationResponse> {
    switch (provider) {
      case VerificationProvider.GOOGLE_MAPS:
        return this.verifyWithGoogleMaps(request);
      case VerificationProvider.POSTAL_SERVICE:
        return this.verifyWithPostalService(request);
      default:
        return this.mockVerification(request);
    }
  }

  private async verifyWithGoogleMaps(
    request: AddressVerificationRequest,
  ): Promise<AddressVerificationResponse> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'Google Maps API key not configured, using mock verification',
      );
      return this.mockVerification(request);
    }

    const address = [
      request.addressLine1,
      request.addressLine2,
      request.city,
      request.stateProvince,
      request.postalCode,
      request.country,
    ]
      .filter(Boolean)
      .join(', ');

    try {
      const url = 'https://maps.googleapis.com/maps/api/geocode/json';
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            address,
            key: apiKey,
          },
        }),
      );

      const { data } = response;

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        return {
          success: true,
          verificationId: `google_${Date.now()}`,
          standardizedAddress: this.parseGoogleAddress(result),
          geolocation: {
            latitude: location.lat,
            longitude: location.lng,
          },
          deliverable: true,
          residential: this.isResidential(result.types),
          commercial: this.isCommercial(result.types),
          vacant: false,
          confidenceScore: 85,
          matchScore: 90,
          qualityScore: 88,
        };
      } else {
        return {
          success: false,
          deliverable: false,
          residential: false,
          commercial: false,
          vacant: false,
          confidenceScore: 0,
          matchScore: 0,
          qualityScore: 0,
          error: `Google Maps verification failed: ${data.status}`,
        };
      }
    } catch (error) {
      this.logger.error('Google Maps API error:', error);
      return this.mockVerification(request);
    }
  }

  private async verifyWithPostalService(
    request: AddressVerificationRequest,
  ): Promise<AddressVerificationResponse> {
    // Placeholder for postal service integration
    this.logger.warn('Postal service verification not implemented, using mock');
    return this.mockVerification(request);
  }

  private mockVerification(
    request: AddressVerificationRequest,
  ): AddressVerificationResponse {
    // Mock verification for development/testing
    const isValidAddress =
      request.postalCode && request.city && request.addressLine1;

    return {
      success: Boolean(isValidAddress),
      verificationId: `mock_${Date.now()}`,
      standardizedAddress: isValidAddress
        ? {
            addressLine1: request.addressLine1,
            addressLine2: request.addressLine2,
            city: request.city,
            stateProvince: request.stateProvince,
            postalCode: request.postalCode,
            country: request.country,
            countryCode: this.getCountryCode(request.country),
          }
        : undefined,
      deliverable: Boolean(isValidAddress),
      residential: true,
      commercial: false,
      vacant: false,
      confidenceScore: isValidAddress ? 75 : 0,
      matchScore: isValidAddress ? 80 : 0,
      qualityScore: isValidAddress ? 78 : 0,
      error: isValidAddress ? undefined : 'Mock verification failed',
    };
  }

  private populateVerificationFromResponse(
    verification: AddressVerification,
    response: AddressVerificationResponse,
  ): void {
    verification.providerReference = response.verificationId;
    verification.confidenceScore = response.confidenceScore;
    verification.matchScore = response.matchScore;
    verification.qualityScore = response.qualityScore;
    verification.isDeliverable = response.deliverable;
    verification.isResidential = response.residential;
    verification.isBusiness = response.commercial;
    verification.isVacant = response.vacant;

    if (response.standardizedAddress) {
      verification.updateVerifiedAddress(response.standardizedAddress);
    }

    if (response.geolocation) {
      verification.updateGeolocation(
        response.geolocation.latitude,
        response.geolocation.longitude,
        response.geolocation.timezone,
      );
    }

    verification.verificationDate = new Date();
  }

  private parseGoogleAddress(result: any): any {
    const components = result.address_components;
    const parsed: any = {};

    for (const component of components) {
      const types = component.types;

      if (types.includes('street_number')) {
        parsed.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        parsed.streetName = component.long_name;
      } else if (types.includes('locality')) {
        parsed.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        parsed.stateProvince = component.long_name;
      } else if (types.includes('postal_code')) {
        parsed.postalCode = component.long_name;
      } else if (types.includes('country')) {
        parsed.country = component.long_name;
        parsed.countryCode = component.short_name;
      }
    }

    return {
      addressLine1: [parsed.streetNumber, parsed.streetName]
        .filter(Boolean)
        .join(' '),
      city: parsed.city,
      stateProvince: parsed.stateProvince,
      postalCode: parsed.postalCode,
      country: parsed.country,
      countryCode: parsed.countryCode,
    };
  }

  private isResidential(types: string[]): boolean {
    return types.some((type) =>
      ['premise', 'subpremise', 'street_address'].includes(type),
    );
  }

  private isCommercial(types: string[]): boolean {
    return types.some((type) => ['establishment', 'business'].includes(type));
  }

  private getCountryCode(country: string): string {
    // Simple country code mapping - in production, use a proper library
    const countryMap: Record<string, string> = {
      'United States': 'US',
      Canada: 'CA',
      'United Kingdom': 'GB',
      Australia: 'AU',
      India: 'IN',
      Germany: 'DE',
      France: 'FR',
      // Add more as needed
    };

    return countryMap[country] || country.substring(0, 2).toUpperCase();
  }

  // Document verification methods
  async verifyDocument(
    request: DocumentVerificationRequest,
  ): Promise<DocumentVerificationResponse> {
    // This would integrate with document verification services
    // For now, return mock response
    this.logger.log(
      `Mock document verification for ${request.documentType}: ${request.documentNumber}`,
    );

    return {
      success: true,
      valid: true,
      expired: false,
      extracted: {
        firstName: request.firstName,
        lastName: request.lastName,
        dateOfBirth: request.dateOfBirth,
        documentNumber: request.documentNumber,
      },
      confidenceScore: 85,
    };
  }

  // Sanctions and PEP screening
  async performSanctionsCheck(
    firstName: string,
    lastName: string,
    dateOfBirth?: string,
    nationality?: string,
  ): Promise<{
    passed: boolean;
    matches: Array<{
      name: string;
      score: number;
      listName: string;
      details: string;
    }>;
    riskScore: number;
  }> {
    // Mock sanctions check - in production, integrate with compliance services
    this.logger.log(`Mock sanctions check for ${firstName} ${lastName}`);

    return {
      passed: true,
      matches: [],
      riskScore: 10,
    };
  }

  async performPepCheck(
    firstName: string,
    lastName: string,
    nationality?: string,
  ): Promise<{
    isPep: boolean;
    matches: Array<{
      name: string;
      position: string;
      country: string;
      score: number;
    }>;
    riskScore: number;
  }> {
    // Mock PEP check - in production, integrate with PEP databases
    this.logger.log(`Mock PEP check for ${firstName} ${lastName}`);

    return {
      isPep: false,
      matches: [],
      riskScore: 5,
    };
  }

  // Utility methods
  async getVerificationStatus(
    verificationId: string,
  ): Promise<VerificationStatus> {
    const verification = await this.addressVerificationRepository.findOne({
      where: { providerReference: verificationId },
    });

    return verification?.status || VerificationStatus.PENDING;
  }

  async bulkVerifyAddresses(
    requests: Array<{
      kycApplicationId: string;
      address: AddressVerificationRequest;
    }>,
  ): Promise<AddressVerification[]> {
    const results: AddressVerification[] = [];

    for (const request of requests) {
      try {
        const result = await this.verifyAddress(
          request.kycApplicationId,
          request.address,
        );
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Bulk verification failed for ${request.kycApplicationId}:`,
          error,
        );
      }
    }

    return results;
  }
}
