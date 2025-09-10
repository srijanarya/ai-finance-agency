import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsPhoneNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ComplianceType,
  ComplianceStatus,
  ComplianceSeverity,
} from '../entities/compliance-check.entity';

export class PersonalAddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State/Province', example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Country code', example: 'US' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Postal code', example: '10001' })
  @IsString()
  postalCode: string;
}

export class PersonalInfoDto {
  @ApiProperty({ description: 'Full legal name', example: 'John Smith' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Date of birth (YYYY-MM-DD)', example: '1990-01-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ description: 'Nationality', example: 'US' })
  @IsString()
  nationality: string;

  @ApiProperty({ description: 'Address information', type: PersonalAddressDto })
  @ValidateNested()
  @Type(() => PersonalAddressDto)
  address: PersonalAddressDto;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ description: 'Email address', example: 'john.smith@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Tax identification number', example: 'TAX123456789' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Passport number', example: 'PA1234567' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional({ description: 'Driving license number', example: 'DL12345678' })
  @IsOptional()
  @IsString()
  drivingLicenseNumber?: string;
}

export class DocumentDto {
  @ApiProperty({
    description: 'Document type',
    enum: ['passport', 'driving_license', 'utility_bill', 'bank_statement', 'tax_document'],
    example: 'passport',
  })
  @IsEnum(['passport', 'driving_license', 'utility_bill', 'bank_statement', 'tax_document'])
  type: 'passport' | 'driving_license' | 'utility_bill' | 'bank_statement' | 'tax_document';

  @ApiProperty({ description: 'Document URL', example: 'https://example.com/documents/passport.pdf' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Whether document is verified', example: true })
  @IsBoolean()
  verified: boolean;
}

export class CreateKYCCheckDto {
  @ApiProperty({ description: 'User ID', example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Personal information', type: PersonalInfoDto })
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @ApiProperty({ description: 'Submitted documents', type: [DocumentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];

  @ApiProperty({
    description: 'Risk profile',
    enum: ['low', 'medium', 'high'],
    example: 'medium',
  })
  @IsEnum(['low', 'medium', 'high'])
  riskProfile: 'low' | 'medium' | 'high';

  @ApiProperty({
    description: 'Investment experience level',
    enum: ['beginner', 'intermediate', 'experienced', 'professional'],
    example: 'intermediate',
  })
  @IsEnum(['beginner', 'intermediate', 'experienced', 'professional'])
  investmentExperience: 'beginner' | 'intermediate' | 'experienced' | 'professional';

  @ApiPropertyOptional({ description: 'Estimated net worth', example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedNetWorth?: number;

  @ApiPropertyOptional({ description: 'Annual income', example: 120000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualIncome?: number;
}

export class TransactionDataDto {
  @ApiProperty({ description: 'Transaction amount', example: 50000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Source of funds', example: 'salary' })
  @IsString()
  sourceOfFunds: string;

  @ApiPropertyOptional({ description: 'Destination account', example: 'ACC123456' })
  @IsOptional()
  @IsString()
  destinationAccount?: string;

  @ApiProperty({ description: 'Transaction purpose', example: 'Investment' })
  @IsString()
  purpose: string;
}

export class PreviousTransactionDto {
  @ApiProperty({ description: 'Transaction amount', example: 25000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Transaction date', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'Transaction type', example: 'DEPOSIT' })
  @IsString()
  type: string;
}

export class UserProfileDto {
  @ApiProperty({ description: 'Risk rating (0-100)', example: 35 })
  @IsNumber()
  @Min(0)
  @Min(100)
  riskRating: number;

  @ApiProperty({ description: 'Previous transactions', type: [PreviousTransactionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviousTransactionDto)
  previousTransactions: PreviousTransactionDto[];

  @ApiProperty({
    description: 'Geographic risk level',
    enum: ['low', 'medium', 'high'],
    example: 'low',
  })
  @IsEnum(['low', 'medium', 'high'])
  geographicRisk: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'Business relationship duration in months', example: 24 })
  @IsNumber()
  @Min(0)
  businessRelationshipDuration: number;
}

export class CreateAMLCheckDto {
  @ApiProperty({ description: 'User ID', example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Transaction data', type: TransactionDataDto })
  @ValidateNested()
  @Type(() => TransactionDataDto)
  transactionData: TransactionDataDto;

  @ApiProperty({ description: 'User profile information', type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  userProfile: UserProfileDto;
}

export class TradeDataDto {
  @ApiProperty({ description: 'Asset symbol', example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Trade side', enum: ['BUY', 'SELL'], example: 'BUY' })
  @IsEnum(['BUY', 'SELL'])
  side: 'BUY' | 'SELL';

  @ApiProperty({ description: 'Trade quantity', example: 100 })
  @IsNumber()
  @Min(0.000001)
  quantity: number;

  @ApiProperty({ description: 'Trade price', example: 150.50 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ description: 'Order type', example: 'MARKET' })
  @IsString()
  orderType: string;

  @ApiProperty({ description: 'Trade timestamp', example: '2024-01-15T14:30:00Z' })
  @IsDateString()
  timestamp: Date;
}

export class MarketDataForComplianceDto {
  @ApiProperty({ description: 'Trading volume', example: 1000000 })
  @IsNumber()
  @Min(0)
  volume: number;

  @ApiProperty({ description: 'Volatility measure', example: 0.25 })
  @IsNumber()
  @Min(0)
  volatility: number;

  @ApiProperty({ description: 'Price movement percentage', example: 0.05 })
  @IsNumber()
  priceMovement: number;

  @ApiProperty({ description: 'Time of day', example: '14:30' })
  @IsString()
  timeOfDay: string;
}

export class CreateTradeComplianceCheckDto {
  @ApiProperty({ description: 'User ID', example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Account ID', example: 'account456' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Trade information', type: TradeDataDto })
  @ValidateNested()
  @Type(() => TradeDataDto)
  tradeData: TradeDataDto;

  @ApiProperty({ description: 'Market data at time of trade', type: MarketDataForComplianceDto })
  @ValidateNested()
  @Type(() => MarketDataForComplianceDto)
  marketData: MarketDataForComplianceDto;
}

export class ComplianceFlagDto {
  @ApiProperty({ description: 'Flag identifier', example: 'high_risk_nationality' })
  flag: string;

  @ApiProperty({ description: 'Severity level', example: 'MAJOR' })
  severity: string;

  @ApiProperty({ description: 'Flag description', example: 'Nationality from high-risk country' })
  description: string;

  @ApiProperty({ description: 'Flagged value', example: 'IR' })
  value: any;

  @ApiProperty({ description: 'Threshold that triggered flag', example: 'allowed_countries' })
  threshold: any;
}

export class ComplianceCheckResultDto {
  @ApiProperty({ description: 'Whether check passed', example: false })
  passed: boolean;

  @ApiProperty({ description: 'Numerical score (0-100)', example: 45 })
  score: number;

  @ApiProperty({ description: 'Compliance flags raised', type: [ComplianceFlagDto] })
  flags: ComplianceFlagDto[];

  @ApiProperty({ description: 'Supporting evidence', example: {} })
  evidence: Record<string, any>;

  @ApiProperty({ description: 'External data sources used', example: ['OFAC', 'PEP_DATABASE'] })
  externalSources: string[];
}

export class ComplianceCheckResponseDto {
  @ApiProperty({ description: 'Check ID', example: 'check_123456' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'user123' })
  userId: string;

  @ApiPropertyOptional({ description: 'Account ID', example: 'account456' })
  accountId?: string;

  @ApiProperty({ enum: ComplianceType, description: 'Type of compliance check' })
  complianceType: ComplianceType;

  @ApiProperty({ enum: ComplianceStatus, description: 'Check status' })
  status: ComplianceStatus;

  @ApiProperty({ enum: ComplianceSeverity, description: 'Severity level' })
  severity: ComplianceSeverity;

  @ApiProperty({ description: 'Check results', type: ComplianceCheckResultDto })
  checkResults: ComplianceCheckResultDto;

  @ApiProperty({ description: 'Rules that were evaluated', example: ['identity_verification', 'document_verification'] })
  rulesEvaluated: string[];

  @ApiProperty({ description: 'Rules that failed', example: ['sanctions_screening'] })
  failedRules: string[];

  @ApiProperty({ description: 'Regulatory references', example: ['KYC_AML_2024', 'EU_GDPR'] })
  regulatoryRefs: string[];

  @ApiProperty({ description: 'Required remedial actions', example: ['Provide additional documentation'] })
  remedialActions: string[];

  @ApiPropertyOptional({ description: 'Next review date', example: '2024-07-15T00:00:00Z' })
  nextReviewDate?: Date;

  @ApiProperty({ description: 'Processing time in milliseconds', example: 1250 })
  processingTimeMs: number;

  @ApiProperty({ description: 'Whether escalation is required', example: false })
  requiresEscalation: boolean;

  @ApiPropertyOptional({ description: 'Escalation reason', example: 'High-risk customer detected' })
  escalationReason?: string;

  @ApiProperty({ description: 'Check creation timestamp', example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Check update timestamp', example: '2024-01-15T10:01:15Z' })
  updatedAt: Date;
}

export class UpdateComplianceCheckDto {
  @ApiPropertyOptional({ enum: ComplianceStatus, description: 'Update check status' })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @ApiPropertyOptional({ description: 'Review comments', example: 'Manual review completed - approved' })
  @IsOptional()
  @IsString()
  reviewComments?: string;

  @ApiPropertyOptional({ description: 'Reviewed by user ID', example: 'compliance_officer_123' })
  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @ApiPropertyOptional({ description: 'Override check result', example: true })
  @IsOptional()
  @IsBoolean()
  overrideResult?: boolean;

  @ApiPropertyOptional({ description: 'Override reason', example: 'Additional verification completed offline' })
  @IsOptional()
  @IsString()
  overrideReason?: string;
}

export class ComplianceReportDto {
  @ApiProperty({ description: 'Report type', example: 'MONTHLY_COMPLIANCE' })
  @IsString()
  reportType: string;

  @ApiProperty({ description: 'Report period start', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  periodStart: Date;

  @ApiProperty({ description: 'Report period end', example: '2024-01-31T23:59:59Z' })
  @IsDateString()
  periodEnd: Date;

  @ApiPropertyOptional({ description: 'Filter by user ID', example: 'user123' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by compliance type', enum: ComplianceType })
  @IsOptional()
  @IsEnum(ComplianceType)
  complianceType?: ComplianceType;

  @ApiPropertyOptional({ description: 'Include detailed results', example: true })
  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean;

  @ApiPropertyOptional({ description: 'Export format', enum: ['JSON', 'CSV', 'PDF'], example: 'PDF' })
  @IsOptional()
  @IsEnum(['JSON', 'CSV', 'PDF'])
  format?: 'JSON' | 'CSV' | 'PDF';
}