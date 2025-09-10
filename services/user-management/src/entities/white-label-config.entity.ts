import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EnterpriseTenant } from './enterprise-tenant.entity';

export enum BrandingTheme {
  LIGHT = 'light',
  DARK = 'dark',
  CUSTOM = 'custom',
  CORPORATE = 'corporate',
}

export enum DeploymentType {
  SUBDOMAIN = 'subdomain',
  CUSTOM_DOMAIN = 'custom_domain',
  PATH_BASED = 'path_based',
  EMBEDDED = 'embedded',
}

export enum SupportedLanguage {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  PT = 'pt',
  JA = 'ja',
  ZH = 'zh',
  KO = 'ko',
  RU = 'ru',
  AR = 'ar',
  HI = 'hi',
}

@Entity('white_label_configs')
@Index(['tenantId'], { unique: true })
@Index(['customDomain'], { unique: true, where: 'custom_domain IS NOT NULL' })
@Index(['subdomain'], { unique: true, where: 'subdomain IS NOT NULL' })
@Index(['isActive'])
export class WhiteLabelConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  // Basic Branding
  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'platform_name' })
  platformName: string;

  @Column({ name: 'tagline', nullable: true })
  tagline?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // Logo and Visual Assets
  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ name: 'logo_dark_url', nullable: true })
  logoDarkUrl?: string;

  @Column({ name: 'favicon_url', nullable: true })
  faviconUrl?: string;

  @Column({ name: 'apple_touch_icon_url', nullable: true })
  appleTouchIconUrl?: string;

  @Column({ name: 'og_image_url', nullable: true })
  ogImageUrl?: string;

  // Color Scheme
  @Column({ name: 'primary_color', default: '#007bff' })
  primaryColor: string;

  @Column({ name: 'secondary_color', default: '#6c757d' })
  secondaryColor: string;

  @Column({ name: 'accent_color', default: '#28a745' })
  accentColor: string;

  @Column({ name: 'background_color', default: '#ffffff' })
  backgroundColor: string;

  @Column({ name: 'text_color', default: '#212529' })
  textColor: string;

  @Column({ name: 'link_color', default: '#007bff' })
  linkColor: string;

  @Column({ name: 'success_color', default: '#28a745' })
  successColor: string;

  @Column({ name: 'warning_color', default: '#ffc107' })
  warningColor: string;

  @Column({ name: 'error_color', default: '#dc3545' })
  errorColor: string;

  // Theme Configuration
  @Column({
    name: 'theme',
    type: 'enum',
    enum: BrandingTheme,
    default: BrandingTheme.LIGHT,
  })
  theme: BrandingTheme;

  @Column({ name: 'custom_css', type: 'text', nullable: true })
  customCss?: string;

  @Column({ name: 'custom_fonts', type: 'simple-json', nullable: true })
  customFonts?: {
    primary?: string;
    secondary?: string;
    headings?: string;
    monospace?: string;
  };

  // Domain and Deployment
  @Column({
    name: 'deployment_type',
    type: 'enum',
    enum: DeploymentType,
    default: DeploymentType.SUBDOMAIN,
  })
  deploymentType: DeploymentType;

  @Column({ name: 'subdomain', nullable: true, unique: true })
  subdomain?: string;

  @Column({ name: 'custom_domain', nullable: true, unique: true })
  customDomain?: string;

  @Column({ name: 'ssl_enabled', default: true })
  sslEnabled: boolean;

  @Column({ name: 'ssl_certificate_arn', nullable: true })
  sslCertificateArn?: string;

  // Contact Information
  @Column({ name: 'support_email', nullable: true })
  supportEmail?: string;

  @Column({ name: 'support_phone', nullable: true })
  supportPhone?: string;

  @Column({ name: 'contact_address', type: 'text', nullable: true })
  contactAddress?: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl?: string;

  @Column({ name: 'privacy_policy_url', nullable: true })
  privacyPolicyUrl?: string;

  @Column({ name: 'terms_of_service_url', nullable: true })
  termsOfServiceUrl?: string;

  // Localization
  @Column({
    name: 'default_language',
    type: 'enum',
    enum: SupportedLanguage,
    default: SupportedLanguage.EN,
  })
  defaultLanguage: SupportedLanguage;

  @Column({
    name: 'supported_languages',
    type: 'simple-array',
    default: () => `'${SupportedLanguage.EN}'`,
  })
  supportedLanguages: SupportedLanguage[];

  @Column({ name: 'default_timezone', default: 'UTC' })
  defaultTimezone: string;

  @Column({ name: 'default_currency', default: 'USD' })
  defaultCurrency: string;

  @Column({ name: 'date_format', default: 'MM/DD/YYYY' })
  dateFormat: string;

  @Column({ name: 'time_format', default: '12h' })
  timeFormat: '12h' | '24h';

  // Feature Configuration
  @Column({ name: 'features_enabled', type: 'simple-json' })
  featuresEnabled: {
    trading?: boolean;
    signals?: boolean;
    education?: boolean;
    portfolio?: boolean;
    analytics?: boolean;
    social?: boolean;
    api?: boolean;
    mobileApp?: boolean;
    notifications?: boolean;
    reports?: boolean;
    compliance?: boolean;
    riskManagement?: boolean;
    customDashboard?: boolean;
    whiteLabeling?: boolean;
  };

  // Navigation and Menu
  @Column({ name: 'navigation_config', type: 'simple-json', nullable: true })
  navigationConfig?: {
    menuItems?: Array<{
      label: string;
      url: string;
      icon?: string;
      permission?: string;
      children?: Array<{
        label: string;
        url: string;
        icon?: string;
        permission?: string;
      }>;
    }>;
    footerLinks?: Array<{
      label: string;
      url: string;
      category?: string;
    }>;
    hideDefaultMenuItems?: string[];
  };

  // Email Templates
  @Column({ name: 'email_templates', type: 'simple-json', nullable: true })
  emailTemplates?: {
    welcome?: { subject: string; htmlTemplate: string; textTemplate?: string };
    passwordReset?: {
      subject: string;
      htmlTemplate: string;
      textTemplate?: string;
    };
    emailVerification?: {
      subject: string;
      htmlTemplate: string;
      textTemplate?: string;
    };
    notification?: {
      subject: string;
      htmlTemplate: string;
      textTemplate?: string;
    };
    report?: { subject: string; htmlTemplate: string; textTemplate?: string };
  };

  // Social Media and External Links
  @Column({ name: 'social_links', type: 'simple-json', nullable: true })
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
    discord?: string;
    github?: string;
  };

  // SEO Configuration
  @Column({ name: 'seo_config', type: 'simple-json', nullable: true })
  seoConfig?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    linkedinInsightId?: string;
  };

  // Integration Settings
  @Column({ name: 'integration_config', type: 'simple-json', nullable: true })
  integrationConfig?: {
    chatbot?: {
      enabled: boolean;
      provider?: 'intercom' | 'zendesk' | 'freshdesk' | 'custom';
      widgetId?: string;
      customScript?: string;
    };
    analytics?: {
      enabled: boolean;
      providers?: Array<{
        name: string;
        trackingId: string;
        config?: Record<string, any>;
      }>;
    };
    helpdesk?: {
      enabled: boolean;
      provider?: 'zendesk' | 'freshdesk' | 'helpscout' | 'custom';
      config?: Record<string, any>;
    };
  };

  // Mobile App Configuration
  @Column({ name: 'mobile_app_config', type: 'simple-json', nullable: true })
  mobileAppConfig?: {
    appName?: string;
    appIcon?: string;
    splashScreen?: string;
    primaryColor?: string;
    deepLinkScheme?: string;
    pushNotifications?: {
      enabled: boolean;
      fcmServerKey?: string;
      apnsCertificate?: string;
    };
    appStore?: {
      iosAppId?: string;
      androidPackageName?: string;
      universalLinks?: string[];
    };
  };

  // Custom Scripts and Tracking
  @Column({ name: 'custom_scripts', type: 'simple-json', nullable: true })
  customScripts?: {
    headerScripts?: string[];
    footerScripts?: string[];
    beforeBodyCloseScripts?: string[];
  };

  // Security and Compliance
  @Column({ name: 'security_config', type: 'simple-json', nullable: true })
  securityConfig?: {
    contentSecurityPolicy?: string;
    corsOrigins?: string[];
    cookiePolicy?: {
      essential: boolean;
      analytics: boolean;
      marketing: boolean;
      preferences: boolean;
    };
    gdprCompliance?: boolean;
    ccpaCompliance?: boolean;
    cookieBannerEnabled?: boolean;
  };

  // Status and Metadata
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'last_deployed_at', type: 'timestamp', nullable: true })
  lastDeployedAt?: Date;

  @Column({ name: 'deployment_status', nullable: true })
  deploymentStatus?:
    | 'pending'
    | 'deploying'
    | 'deployed'
    | 'failed'
    | 'rollback';

  @Column({ name: 'deployment_version', nullable: true })
  deploymentVersion?: string;

  @Column({ name: 'configuration_hash', nullable: true })
  configurationHash?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => EnterpriseTenant, (tenant) => tenant.whiteLabelConfigs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: EnterpriseTenant;

  // Virtual Properties
  get fullDomainUrl(): string {
    if (
      this.deploymentType === DeploymentType.CUSTOM_DOMAIN &&
      this.customDomain
    ) {
      return `${this.sslEnabled ? 'https' : 'http'}://${this.customDomain}`;
    }
    if (this.deploymentType === DeploymentType.SUBDOMAIN && this.subdomain) {
      return `${this.sslEnabled ? 'https' : 'http'}://${this.subdomain}.treumalgotech.com`;
    }
    return '';
  }

  get isConfigurationComplete(): boolean {
    return !!(
      this.companyName &&
      this.platformName &&
      this.primaryColor &&
      this.logoUrl &&
      ((this.deploymentType === DeploymentType.SUBDOMAIN && this.subdomain) ||
        (this.deploymentType === DeploymentType.CUSTOM_DOMAIN &&
          this.customDomain))
    );
  }

  get isReadyForDeployment(): boolean {
    return this.isConfigurationComplete && this.isActive && !this.isPublished;
  }

  get hasCustomBranding(): boolean {
    return !!(
      this.logoUrl ||
      this.customCss ||
      this.primaryColor !== '#007bff' ||
      this.theme === BrandingTheme.CUSTOM
    );
  }

  get supportedFeaturesCount(): number {
    return Object.values(this.featuresEnabled || {}).filter(
      (enabled) => enabled,
    ).length;
  }

  // Methods
  enableFeature(feature: keyof WhiteLabelConfig['featuresEnabled']): void {
    if (!this.featuresEnabled) {
      this.featuresEnabled = {};
    }
    this.featuresEnabled[feature] = true;
  }

  disableFeature(feature: keyof WhiteLabelConfig['featuresEnabled']): void {
    if (!this.featuresEnabled) {
      this.featuresEnabled = {};
    }
    this.featuresEnabled[feature] = false;
  }

  isFeatureEnabled(
    feature: keyof WhiteLabelConfig['featuresEnabled'],
  ): boolean {
    return this.featuresEnabled?.[feature] || false;
  }

  addSupportedLanguage(language: SupportedLanguage): void {
    if (!this.supportedLanguages.includes(language)) {
      this.supportedLanguages.push(language);
    }
  }

  removeSupportedLanguage(language: SupportedLanguage): void {
    this.supportedLanguages = this.supportedLanguages.filter(
      (lang) => lang !== language,
    );
  }

  updateSocialLink(
    platform: keyof WhiteLabelConfig['socialLinks'],
    url: string,
  ): void {
    if (!this.socialLinks) {
      this.socialLinks = {};
    }
    this.socialLinks[platform] = url;
  }

  removeSocialLink(platform: keyof WhiteLabelConfig['socialLinks']): void {
    if (this.socialLinks) {
      delete this.socialLinks[platform];
    }
  }

  addNavigationMenuItem(item: {
    label: string;
    url: string;
    icon?: string;
    permission?: string;
    children?: Array<{
      label: string;
      url: string;
      icon?: string;
      permission?: string;
    }>;
  }): void {
    if (!this.navigationConfig) {
      this.navigationConfig = {};
    }
    if (!this.navigationConfig.menuItems) {
      this.navigationConfig.menuItems = [];
    }
    this.navigationConfig.menuItems.push(item);
  }

  removeNavigationMenuItem(label: string): void {
    if (this.navigationConfig?.menuItems) {
      this.navigationConfig.menuItems = this.navigationConfig.menuItems.filter(
        (item) => item.label !== label,
      );
    }
  }

  updateEmailTemplate(
    type: keyof WhiteLabelConfig['emailTemplates'],
    template: { subject: string; htmlTemplate: string; textTemplate?: string },
  ): void {
    if (!this.emailTemplates) {
      this.emailTemplates = {};
    }
    this.emailTemplates[type] = template;
  }

  addCustomScript(
    type: keyof WhiteLabelConfig['customScripts'],
    script: string,
  ): void {
    if (!this.customScripts) {
      this.customScripts = {};
    }
    if (!this.customScripts[type]) {
      this.customScripts[type] = [];
    }
    this.customScripts[type]!.push(script);
  }

  removeCustomScript(
    type: keyof WhiteLabelConfig['customScripts'],
    script: string,
  ): void {
    if (this.customScripts?.[type]) {
      this.customScripts[type] = this.customScripts[type]!.filter(
        (s) => s !== script,
      );
    }
  }

  publish(): void {
    this.isPublished = true;
    this.publishedAt = new Date();
    this.deploymentStatus = 'pending';
  }

  unpublish(): void {
    this.isPublished = false;
    this.publishedAt = null;
    this.deploymentStatus = null;
  }

  markAsDeployed(version: string): void {
    this.deploymentStatus = 'deployed';
    this.lastDeployedAt = new Date();
    this.deploymentVersion = version;
  }

  markDeploymentFailed(): void {
    this.deploymentStatus = 'failed';
  }

  generateConfigurationHash(): string {
    const configString = JSON.stringify({
      companyName: this.companyName,
      platformName: this.platformName,
      theme: this.theme,
      primaryColor: this.primaryColor,
      logoUrl: this.logoUrl,
      customCss: this.customCss,
      featuresEnabled: this.featuresEnabled,
      navigationConfig: this.navigationConfig,
    });

    // Simple hash function - in production, use a proper crypto hash
    let hash = 0;
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  hasConfigurationChanged(): boolean {
    const currentHash = this.generateConfigurationHash();
    return this.configurationHash !== currentHash;
  }

  updateConfigurationHash(): void {
    this.configurationHash = this.generateConfigurationHash();
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.companyName?.trim()) {
      errors.push('Company name is required');
    }

    if (!this.platformName?.trim()) {
      errors.push('Platform name is required');
    }

    if (
      this.deploymentType === DeploymentType.SUBDOMAIN &&
      !this.subdomain?.trim()
    ) {
      errors.push('Subdomain is required for subdomain deployment');
    }

    if (
      this.deploymentType === DeploymentType.CUSTOM_DOMAIN &&
      !this.customDomain?.trim()
    ) {
      errors.push('Custom domain is required for custom domain deployment');
    }

    if (
      this.supportEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.supportEmail)
    ) {
      errors.push('Invalid support email format');
    }

    if (this.websiteUrl && !/^https?:\/\/.+/.test(this.websiteUrl)) {
      errors.push('Invalid website URL format');
    }

    if (
      this.customDomain &&
      !/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        this.customDomain,
      )
    ) {
      errors.push('Invalid custom domain format');
    }

    if (
      this.subdomain &&
      !/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(this.subdomain)
    ) {
      errors.push('Invalid subdomain format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static createDefault(
    tenantId: string,
    companyName: string,
  ): Partial<WhiteLabelConfig> {
    return {
      tenantId,
      companyName,
      platformName: `${companyName} Trading Platform`,
      theme: BrandingTheme.LIGHT,
      deploymentType: DeploymentType.SUBDOMAIN,
      defaultLanguage: SupportedLanguage.EN,
      supportedLanguages: [SupportedLanguage.EN],
      defaultTimezone: 'UTC',
      defaultCurrency: 'USD',
      sslEnabled: true,
      isActive: true,
      isPublished: false,
      featuresEnabled: {
        trading: true,
        signals: true,
        education: true,
        portfolio: true,
        analytics: true,
        social: false,
        api: true,
        mobileApp: false,
        notifications: true,
        reports: true,
        compliance: true,
        riskManagement: true,
        customDashboard: false,
        whiteLabeling: false,
      },
    };
  }
}
