import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TaxRate {
  country: string;
  state?: string;
  rate: number;
  type: 'VAT' | 'GST' | 'SALES_TAX';
  jurisdiction: string;
}

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  // Tax rates database - in production this would be from external service or database
  private readonly taxRates: TaxRate[] = [
    // United States - State Sales Tax
    { country: 'US', state: 'CA', rate: 0.0875, type: 'SALES_TAX', jurisdiction: 'California' },
    { country: 'US', state: 'NY', rate: 0.08, type: 'SALES_TAX', jurisdiction: 'New York' },
    { country: 'US', state: 'TX', rate: 0.0625, type: 'SALES_TAX', jurisdiction: 'Texas' },
    { country: 'US', state: 'FL', rate: 0.06, type: 'SALES_TAX', jurisdiction: 'Florida' },
    { country: 'US', state: 'WA', rate: 0.065, type: 'SALES_TAX', jurisdiction: 'Washington' },
    { country: 'US', rate: 0, type: 'SALES_TAX', jurisdiction: 'United States (no state)' },

    // European Union - VAT
    { country: 'DE', rate: 0.19, type: 'VAT', jurisdiction: 'Germany' },
    { country: 'FR', rate: 0.20, type: 'VAT', jurisdiction: 'France' },
    { country: 'GB', rate: 0.20, type: 'VAT', jurisdiction: 'United Kingdom' },
    { country: 'ES', rate: 0.21, type: 'VAT', jurisdiction: 'Spain' },
    { country: 'IT', rate: 0.22, type: 'VAT', jurisdiction: 'Italy' },
    { country: 'NL', rate: 0.21, type: 'VAT', jurisdiction: 'Netherlands' },

    // Other countries
    { country: 'CA', rate: 0.13, type: 'GST', jurisdiction: 'Canada' },
    { country: 'AU', rate: 0.10, type: 'GST', jurisdiction: 'Australia' },
    { country: 'SG', rate: 0.07, type: 'GST', jurisdiction: 'Singapore' },
    { country: 'JP', rate: 0.10, type: 'SALES_TAX', jurisdiction: 'Japan' },
  ];

  constructor(private configService: ConfigService) {}

  async calculateTax(
    amount: number,
    currency: string,
    country?: string,
    state?: string,
  ): Promise<number> {
    if (!country || amount <= 0) {
      return 0;
    }

    try {
      const taxRate = this.getTaxRate(country, state);
      const taxAmount = amount * taxRate.rate;

      this.logger.debug(
        `Tax calculated: ${amount} ${currency} * ${taxRate.rate * 100}% = ${taxAmount} (${taxRate.jurisdiction})`,
      );

      return Math.round(taxAmount * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      this.logger.error(`Error calculating tax for ${country}/${state}`, error.stack);
      return 0; // Return 0 tax if calculation fails
    }
  }

  async calculateTaxBreakdown(
    amount: number,
    currency: string,
    country?: string,
    state?: string,
  ): Promise<{
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    jurisdiction: string;
    taxType: string;
  }> {
    const taxAmount = await this.calculateTax(amount, currency, country, state);
    const taxRate = country ? this.getTaxRate(country, state) : { rate: 0, jurisdiction: 'Unknown', type: 'N/A' };

    return {
      subtotal: amount,
      taxRate: taxRate.rate * 100, // Convert to percentage
      taxAmount,
      total: amount + taxAmount,
      jurisdiction: taxRate.jurisdiction,
      taxType: taxRate.type,
    };
  }

  getTaxRate(country: string, state?: string): TaxRate {
    // First try to find specific state/province rate
    if (state) {
      const stateRate = this.taxRates.find(
        rate => rate.country === country && rate.state === state,
      );
      if (stateRate) {
        return stateRate;
      }
    }

    // Fall back to country rate
    const countryRate = this.taxRates.find(
      rate => rate.country === country && !rate.state,
    );

    if (countryRate) {
      return countryRate;
    }

    // Default to no tax if country not found
    return {
      country,
      state,
      rate: 0,
      type: 'SALES_TAX',
      jurisdiction: `${country}${state ? `/${state}` : ''} (unknown)`,
    };
  }

  isBusinessLocation(country: string, state?: string): boolean {
    // Define where the business has tax nexus
    const businessLocations = [
      { country: 'US', states: ['CA', 'NY', 'TX'] },
      { country: 'GB' },
      { country: 'DE' },
    ];

    return businessLocations.some(location => {
      if (location.country !== country) return false;
      if (!location.states) return true; // No state restriction
      return !state || location.states.includes(state);
    });
  }

  shouldCollectTax(
    amount: number,
    currency: string,
    country?: string,
    state?: string,
    isBusinessCustomer: boolean = false,
  ): boolean {
    // Don't collect tax for small amounts
    if (amount < 1) {
      return false;
    }

    // Don't collect tax if no location provided
    if (!country) {
      return false;
    }

    // Check if we have tax nexus in this location
    if (!this.isBusinessLocation(country, state)) {
      return false;
    }

    // Business customers in some jurisdictions may be tax-exempt
    if (isBusinessCustomer && this.isB2BExemptLocation(country)) {
      return false;
    }

    return true;
  }

  private isB2BExemptLocation(country: string): boolean {
    // EU B2B transactions may be exempt from VAT with valid VAT number
    const euCountries = ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'SE', 'DK'];
    return euCountries.includes(country);
  }

  async validateVATNumber(vatNumber: string, country: string): Promise<boolean> {
    // In production, this would integrate with VIES or similar service
    this.logger.debug(`Validating VAT number ${vatNumber} for ${country}`);
    
    // Basic format validation
    const vatPatterns: Record<string, RegExp> = {
      'DE': /^DE[0-9]{9}$/,
      'FR': /^FR[A-Z0-9]{2}[0-9]{9}$/,
      'GB': /^GB[0-9]{9}$/,
      'ES': /^ES[A-Z0-9][0-9]{7}[A-Z0-9]$/,
      'IT': /^IT[0-9]{11}$/,
      'NL': /^NL[0-9]{9}B[0-9]{2}$/,
    };

    const pattern = vatPatterns[country];
    if (!pattern) {
      return false;
    }

    return pattern.test(vatNumber.replace(/\s/g, ''));
  }

  async getTaxReport(
    startDate: Date,
    endDate: Date,
    jurisdiction?: string,
  ): Promise<{
    jurisdiction: string;
    totalTaxCollected: number;
    totalTransactions: number;
    averageTaxRate: number;
    breakdown: Array<{
      taxType: string;
      amount: number;
      transactions: number;
    }>;
  }> {
    // This would query the database for actual tax collection data
    this.logger.log(`Generating tax report for ${startDate} to ${endDate}`);
    
    // Placeholder implementation
    return {
      jurisdiction: jurisdiction || 'All',
      totalTaxCollected: 0,
      totalTransactions: 0,
      averageTaxRate: 0,
      breakdown: [],
    };
  }

  getSupportedTaxJurisdictions(): TaxRate[] {
    return [...this.taxRates];
  }

  async estimateTaxLiability(
    projectedRevenue: number,
    currency: string,
    country: string,
    state?: string,
  ): Promise<{
    estimatedTax: number;
    taxRate: number;
    jurisdiction: string;
    recommendations: string[];
  }> {
    const taxRate = this.getTaxRate(country, state);
    const estimatedTax = projectedRevenue * taxRate.rate;

    const recommendations: string[] = [];
    
    if (taxRate.rate > 0.15) {
      recommendations.push('Consider tax optimization strategies for high-tax jurisdiction');
    }
    
    if (taxRate.type === 'VAT' && projectedRevenue > 100000) {
      recommendations.push('Ensure VAT registration compliance for high revenue volumes');
    }

    return {
      estimatedTax,
      taxRate: taxRate.rate * 100,
      jurisdiction: taxRate.jurisdiction,
      recommendations,
    };
  }
}