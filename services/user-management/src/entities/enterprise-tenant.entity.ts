import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { WhiteLabelConfig } from './white-label-config.entity';

export enum OrganizationType {
  HEDGE_FUND = 'hedge_fund',
  ASSET_MANAGER = 'asset_manager',
  INVESTMENT_BANK = 'investment_bank',
  FAMILY_OFFICE = 'family_office',
  PENSION_FUND = 'pension_fund',
  INSURANCE_COMPANY = 'insurance_company',
  SOVEREIGN_WEALTH_FUND = 'sovereign_wealth_fund',
  ENDOWMENT = 'endowment',
  PRIVATE_EQUITY = 'private_equity',
  VENTURE_CAPITAL = 'venture_capital',
  BROKER_DEALER = 'broker_dealer',
  ROBO_ADVISOR = 'robo_advisor',
  FINTECH_COMPANY = 'fintech_company',
  BANK = 'bank',
  CREDIT_UNION = 'credit_union',
  PROP_TRADING_FIRM = 'prop_trading_firm',
  COMMODITY_TRADING_ADVISOR = 'commodity_trading_advisor',
  REGISTERED_INVESTMENT_ADVISOR = 'registered_investment_advisor',
  OTHER = 'other',
}

export enum SubscriptionTier {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  INSTITUTIONAL = 'institutional',
  CUSTOM = 'custom',
}

export enum TenantStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  ONBOARDING = 'onboarding',
  CHURNED = 'churned',
}

export enum ComplianceRegime {
  US_SEC = 'us_sec',
  EU_MIFID2 = 'eu_mifid2',
  UK_FCA = 'uk_fca',
  FINRA = 'finra',
  CFTC = 'cftc',
  AUSTRALIA_ASIC = 'australia_asic',
  CANADA_CSA = 'canada_csa',
  JAPAN_FSA = 'japan_fsa',
  SINGAPORE_MAS = 'singapore_mas',
  HONG_KONG_SFC = 'hong_kong_sfc',
  BRAZIL_CVM = 'brazil_cvm',
  INDIA_SEBI = 'india_sebi',
  CUSTOM = 'custom',
}

@Entity('enterprise_tenants')
@Index(['tenantCode'], { unique: true })
@Index(['status'])
@Index(['subscriptionTier'])
@Index(['contractStartDate'])
@Index(['contractEndDate'])
@Index(['createdAt'])
export class EnterpriseTenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_code', unique: true, length: 50 })
  @Index()
  tenantCode: string;

  // Organization Information
  @Column({ name: 'organization_name' })
  organizationName: string;

  @Column({ name: 'legal_entity_name', nullable: true })
  legalEntityName?: string;

  @Column({
    name: 'organization_type',
    type: 'enum',
    enum: OrganizationType,
  })
  organizationType: OrganizationType;

  @Column({ name: 'industry', nullable: true })
  industry?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  // Contact Information
  @Column({ name: 'primary_contact_name' })
  primaryContactName: string;

  @Column({ name: 'primary_contact_email' })
  primaryContactEmail: string;

  @Column({ name: 'primary_contact_phone', nullable: true })
  primaryContactPhone?: string;

  @Column({ name: 'primary_contact_title', nullable: true })
  primaryContactTitle?: string;

  @Column({ name: 'billing_contact_name', nullable: true })
  billingContactName?: string;

  @Column({ name: 'billing_contact_email', nullable: true })
  billingContactEmail?: string;

  @Column({ name: 'technical_contact_name', nullable: true })
  technicalContactName?: string;

  @Column({ name: 'technical_contact_email', nullable: true })
  technicalContactEmail?: string;

  // Address Information
  @Column({ name: 'headquarters_address', type: 'text', nullable: true })
  headquartersAddress?: string;

  @Column({ name: 'headquarters_city', nullable: true })
  headquartersCity?: string;

  @Column({ name: 'headquarters_state', nullable: true })
  headquartersState?: string;

  @Column({ name: 'headquarters_country', nullable: true })
  headquartersCountry?: string;

  @Column({ name: 'headquarters_postal_code', nullable: true })
  headquartersPostalCode?: string;

  @Column({ name: 'billing_address', type: 'text', nullable: true })
  billingAddress?: string;

  @Column({ name: 'billing_city', nullable: true })
  billingCity?: string;

  @Column({ name: 'billing_state', nullable: true })
  billingState?: string;

  @Column({ name: 'billing_country', nullable: true })
  billingCountry?: string;

  @Column({ name: 'billing_postal_code', nullable: true })
  billingPostalCode?: string;

  // Subscription and Contract
  @Column({
    name: 'subscription_tier',
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.ENTERPRISE,
  })
  subscriptionTier: SubscriptionTier;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ONBOARDING,
  })
  @Index()
  status: TenantStatus;

  @Column({ name: 'contract_start_date', type: 'date' })
  @Index()
  contractStartDate: Date;

  @Column({ name: 'contract_end_date', type: 'date' })
  @Index()
  contractEndDate: Date;

  @Column({ name: 'auto_renewal', default: true })
  autoRenewal: boolean;

  @Column({ name: 'renewal_notice_days', default: 30 })
  renewalNoticeDays: number;

  // Financial Information
  @Column({
    name: 'annual_contract_value',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  annualContractValue: number;

  @Column({
    name: 'monthly_recurring_revenue',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  monthlyRecurringRevenue?: number;

  @Column({
    name: 'setup_fee',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  setupFee?: number;

  @Column({ name: 'currency', default: 'USD' })
  currency: string;

  @Column({ name: 'payment_terms', nullable: true })
  paymentTerms?: string; // e.g., "Net 30", "Annually in advance"

  @Column({ name: 'billing_frequency', nullable: true })
  billingFrequency?: 'monthly' | 'quarterly' | 'annually' | 'custom';

  @Column({ name: 'next_billing_date', type: 'date', nullable: true })
  nextBillingDate?: Date;

  // Usage and Limits
  @Column({ name: 'max_users', default: 100 })
  maxUsers: number;

  @Column({ name: 'current_user_count', default: 0 })
  currentUserCount: number;

  @Column({ name: 'max_api_calls_per_month', nullable: true })
  maxApiCallsPerMonth?: number;

  @Column({ name: 'current_api_calls_this_month', default: 0 })
  currentApiCallsThisMonth: number;

  @Column({ name: 'max_data_storage_gb', nullable: true })
  maxDataStorageGb?: number;

  @Column({
    name: 'current_data_storage_gb',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  currentDataStorageGb: number;

  @Column({
    name: 'max_trading_volume_per_month',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: true,
  })
  maxTradingVolumePerMonth?: number;

  @Column({
    name: 'current_trading_volume_this_month',
    type: 'decimal',
    precision: 20,
    scale: 2,
    default: 0,
  })
  currentTradingVolumeThisMonth: number;

  // Features and Capabilities
  @Column({ name: 'enabled_features', type: 'simple-json' })
  enabledFeatures: {
    trading?: boolean;
    signals?: boolean;
    education?: boolean;
    portfolio?: boolean;
    analytics?: boolean;
    api?: boolean;
    whiteLabel?: boolean;
    customBranding?: boolean;
    sso?: boolean;
    multiTenant?: boolean;
    advancedReporting?: boolean;
    riskManagement?: boolean;
    compliance?: boolean;
    mobileApp?: boolean;
    realTimeData?: boolean;
    algorithmicTrading?: boolean;
    paperTrading?: boolean;
    backtesting?: boolean;
    socialTrading?: boolean;
    copyTrading?: boolean;
    customIndicators?: boolean;
    advancedCharts?: boolean;
    newsAndSentiment?: boolean;
    economicCalendar?: boolean;
    marketScanner?: boolean;
    watchlists?: boolean;
    alerts?: boolean;
    webhooks?: boolean;
    csvExports?: boolean;
    pdfReports?: boolean;
    auditLogs?: boolean;
    userManagement?: boolean;
    roleBasedAccess?: boolean;
    ipWhitelisting?: boolean;
    twoFactorAuth?: boolean;
    encryptedStorage?: boolean;
    dedictatedSupport?: boolean;
    customIntegrations?: boolean;
    priority?: boolean;
  };

  // Branding and Configuration
  @Column({ name: 'branding_config', type: 'simple-json', nullable: true })
  brandingConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    customCss?: string;
    customDomain?: string;
    subdomain?: string;
  };

  // Compliance and Regulatory
  @Column({
    name: 'compliance_regimes',
    type: 'simple-array',
    nullable: true,
  })
  complianceRegimes?: ComplianceRegime[];

  @Column({ name: 'regulatory_entity_id', nullable: true })
  regulatoryEntityId?: string; // SEC CRD#, FCA FRN, etc.

  @Column({ name: 'requires_kyc', default: true })
  requiresKyc: boolean;

  @Column({ name: 'requires_aml', default: true })
  requiresAml: boolean;

  @Column({
    name: 'data_residency_requirements',
    type: 'simple-array',
    nullable: true,
  })
  dataResidencyRequirements?: string[]; // Countries where data must reside

  @Column({
    name: 'encryption_requirements',
    type: 'simple-json',
    nullable: true,
  })
  encryptionRequirements?: {
    atRest: boolean;
    inTransit: boolean;
    keyManagement?: string;
  };

  // Technical Configuration
  @Column({ name: 'api_rate_limits', type: 'simple-json', nullable: true })
  apiRateLimits?: {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };

  @Column({ name: 'ip_whitelist', type: 'simple-array', nullable: true })
  ipWhitelist?: string[];

  @Column({ name: 'allowed_domains', type: 'simple-array', nullable: true })
  allowedDomains?: string[];

  @Column({ name: 'webhook_endpoints', type: 'simple-json', nullable: true })
  webhookEndpoints?: Array<{
    url: string;
    events: string[];
    secret?: string;
    active: boolean;
  }>;

  @Column({ name: 'sso_config', type: 'simple-json', nullable: true })
  ssoConfig?: {
    enabled: boolean;
    provider?: 'saml' | 'oidc' | 'oauth2';
    entityId?: string;
    ssoUrl?: string;
    x509Certificate?: string;
    attributeMapping?: Record<string, string>;
  };

  // Support and Success
  @Column({ name: 'support_tier', nullable: true })
  supportTier?: 'standard' | 'premium' | 'enterprise' | 'white_glove';

  @Column({ name: 'dedicated_csm', default: false })
  dedicatedCsm: boolean; // Customer Success Manager

  @Column({ name: 'csm_email', nullable: true })
  csmEmail?: string;

  @Column({ name: 'technical_account_manager', default: false })
  technicalAccountManager: boolean;

  @Column({ name: 'tam_email', nullable: true })
  tamEmail?: string;

  @Column({ name: 'onboarding_status', nullable: true })
  onboardingStatus?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';

  @Column({
    name: 'onboarding_completed_at',
    type: 'timestamp',
    nullable: true,
  })
  onboardingCompletedAt?: Date;

  @Column({ name: 'launch_date', type: 'date', nullable: true })
  launchDate?: Date;

  // Health and Metrics
  @Column({
    name: 'health_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  healthScore?: number; // 0-100

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({
    name: 'churn_risk_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  churnRiskScore?: number; // 0-100

  @Column({ name: 'nps_score', nullable: true })
  npsScore?: number; // Net Promoter Score

  @Column({
    name: 'satisfaction_score',
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  satisfactionScore?: number; // 1-5 scale

  // Metadata and Notes
  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ name: 'salesforce_account_id', nullable: true })
  salesforceAccountId?: string;

  @Column({ name: 'hubspot_company_id', nullable: true })
  hubspotCompanyId?: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Relations
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => WhiteLabelConfig, (config) => config.tenant)
  whiteLabelConfigs: WhiteLabelConfig[];

  // Virtual Properties
  get isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }

  get isExpired(): boolean {
    return this.contractEndDate < new Date();
  }

  get daysUntilExpiry(): number {
    const now = new Date();
    const timeDiff = this.contractEndDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  get contractDurationInMonths(): number {
    const timeDiff =
      this.contractEndDate.getTime() - this.contractStartDate.getTime();
    return Math.round(timeDiff / (1000 * 3600 * 24 * 30.44));
  }

  get userUtilizationPercentage(): number {
    return this.maxUsers > 0
      ? (this.currentUserCount / this.maxUsers) * 100
      : 0;
  }

  get apiUtilizationPercentage(): number {
    return this.maxApiCallsPerMonth
      ? (this.currentApiCallsThisMonth / this.maxApiCallsPerMonth) * 100
      : 0;
  }

  get storageUtilizationPercentage(): number {
    return this.maxDataStorageGb
      ? (this.currentDataStorageGb / this.maxDataStorageGb) * 100
      : 0;
  }

  get tradingVolumeUtilizationPercentage(): number {
    return this.maxTradingVolumePerMonth
      ? (this.currentTradingVolumeThisMonth / this.maxTradingVolumePerMonth) *
          100
      : 0;
  }

  get isHighValue(): boolean {
    return this.annualContractValue >= 100000; // $100k+ ACV
  }

  get isTrialCustomer(): boolean {
    return this.status === TenantStatus.TRIAL;
  }

  get hasWhiteLabeling(): boolean {
    return this.enabledFeatures?.whiteLabel || false;
  }

  get enabledFeaturesCount(): number {
    return Object.values(this.enabledFeatures || {}).filter(
      (enabled) => enabled,
    ).length;
  }

  // Methods
  addUser(): void {
    this.currentUserCount += 1;
  }

  removeUser(): void {
    if (this.currentUserCount > 0) {
      this.currentUserCount -= 1;
    }
  }

  canAddUser(): boolean {
    return this.currentUserCount < this.maxUsers;
  }

  addApiCall(): void {
    this.currentApiCallsThisMonth += 1;
  }

  canMakeApiCall(): boolean {
    return (
      !this.maxApiCallsPerMonth ||
      this.currentApiCallsThisMonth < this.maxApiCallsPerMonth
    );
  }

  resetMonthlyCounters(): void {
    this.currentApiCallsThisMonth = 0;
    this.currentTradingVolumeThisMonth = 0;
  }

  enableFeature(feature: keyof EnterpriseTenant['enabledFeatures']): void {
    if (!this.enabledFeatures) {
      this.enabledFeatures = {};
    }
    this.enabledFeatures[feature] = true;
  }

  disableFeature(feature: keyof EnterpriseTenant['enabledFeatures']): void {
    if (!this.enabledFeatures) {
      this.enabledFeatures = {};
    }
    this.enabledFeatures[feature] = false;
  }

  isFeatureEnabled(
    feature: keyof EnterpriseTenant['enabledFeatures'],
  ): boolean {
    return this.enabledFeatures?.[feature] || false;
  }

  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter((t) => t !== tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  activate(): void {
    this.status = TenantStatus.ACTIVE;
    if (!this.launchDate) {
      this.launchDate = new Date();
    }
  }

  suspend(): void {
    this.status = TenantStatus.SUSPENDED;
  }

  cancel(): void {
    this.status = TenantStatus.CANCELLED;
  }

  expire(): void {
    this.status = TenantStatus.EXPIRED;
  }

  updateActivity(): void {
    this.lastActivityAt = new Date();
  }

  updateHealthScore(score: number): void {
    this.healthScore = Math.max(0, Math.min(100, score));
  }

  updateChurnRisk(score: number): void {
    this.churnRiskScore = Math.max(0, Math.min(100, score));
  }

  renewContract(newEndDate: Date, newAcv?: number): void {
    this.contractEndDate = newEndDate;
    if (newAcv) {
      this.annualContractValue = newAcv;
    }
    if (this.status === TenantStatus.EXPIRED) {
      this.status = TenantStatus.ACTIVE;
    }
  }

  completeOnboarding(): void {
    this.onboardingStatus = 'completed';
    this.onboardingCompletedAt = new Date();
    if (this.status === TenantStatus.ONBOARDING) {
      this.status = TenantStatus.ACTIVE;
    }
  }

  addWebhookEndpoint(url: string, events: string[], secret?: string): void {
    if (!this.webhookEndpoints) {
      this.webhookEndpoints = [];
    }
    this.webhookEndpoints.push({
      url,
      events,
      secret,
      active: true,
    });
  }

  removeWebhookEndpoint(url: string): void {
    if (this.webhookEndpoints) {
      this.webhookEndpoints = this.webhookEndpoints.filter(
        (endpoint) => endpoint.url !== url,
      );
    }
  }

  addIpToWhitelist(ip: string): void {
    if (!this.ipWhitelist) {
      this.ipWhitelist = [];
    }
    if (!this.ipWhitelist.includes(ip)) {
      this.ipWhitelist.push(ip);
    }
  }

  removeIpFromWhitelist(ip: string): void {
    if (this.ipWhitelist) {
      this.ipWhitelist = this.ipWhitelist.filter(
        (whitelistedIp) => whitelistedIp !== ip,
      );
    }
  }

  isIpWhitelisted(ip: string): boolean {
    return (
      !this.ipWhitelist ||
      this.ipWhitelist.length === 0 ||
      this.ipWhitelist.includes(ip)
    );
  }

  static generateTenantCode(organizationName: string): string {
    const sanitized = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
    const timestamp = Date.now().toString(36).slice(-6);
    return `${sanitized}_${timestamp}`;
  }

  static createEnterprise(
    organizationName: string,
    organizationType: OrganizationType,
    primaryContactName: string,
    primaryContactEmail: string,
    subscriptionTier: SubscriptionTier = SubscriptionTier.ENTERPRISE,
    annualContractValue: number = 0,
  ): Partial<EnterpriseTenant> {
    const tenantCode = this.generateTenantCode(organizationName);
    const now = new Date();
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate(),
    );

    return {
      tenantCode,
      organizationName,
      organizationType,
      primaryContactName,
      primaryContactEmail,
      subscriptionTier,
      status: TenantStatus.ONBOARDING,
      contractStartDate: now,
      contractEndDate: oneYearFromNow,
      annualContractValue,
      currency: 'USD',
      maxUsers:
        subscriptionTier === SubscriptionTier.STARTER
          ? 10
          : subscriptionTier === SubscriptionTier.PROFESSIONAL
            ? 50
            : subscriptionTier === SubscriptionTier.ENTERPRISE
              ? 200
              : 1000,
      currentUserCount: 0,
      autoRenewal: true,
      renewalNoticeDays: 30,
      enabledFeatures: {
        trading: true,
        signals: true,
        education: true,
        portfolio: true,
        analytics: true,
        api: subscriptionTier !== SubscriptionTier.STARTER,
        whiteLabel: subscriptionTier === SubscriptionTier.INSTITUTIONAL,
        customBranding:
          subscriptionTier === SubscriptionTier.ENTERPRISE ||
          subscriptionTier === SubscriptionTier.INSTITUTIONAL,
        sso:
          subscriptionTier === SubscriptionTier.ENTERPRISE ||
          subscriptionTier === SubscriptionTier.INSTITUTIONAL,
        advancedReporting:
          subscriptionTier === SubscriptionTier.ENTERPRISE ||
          subscriptionTier === SubscriptionTier.INSTITUTIONAL,
        riskManagement: true,
        compliance: true,
        dedictatedSupport: subscriptionTier === SubscriptionTier.INSTITUTIONAL,
        priority: subscriptionTier === SubscriptionTier.INSTITUTIONAL,
      },
      requiresKyc: true,
      requiresAml: true,
      onboardingStatus: 'not_started',
      supportTier:
        subscriptionTier === SubscriptionTier.INSTITUTIONAL
          ? 'enterprise'
          : 'standard',
    };
  }
}
