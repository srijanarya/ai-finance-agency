import crypto from 'crypto';

export class TestHelpers {
  /**
   * Generate a secure password hash
   */
  static async hashPassword(password: string): Promise<string> {
    // Simple hash for testing - in production you'd use bcrypt
    return crypto.createHash('sha256').update(password + 'test_salt').digest('hex');
  }

  /**
   * Generate a random email address for testing
   */
  static generateTestEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}_${timestamp}_${random}@aifinance.test`;
  }

  /**
   * Generate a random phone number for testing
   */
  static generateTestPhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1-${areaCode}-${exchange}-${number}`;
  }

  /**
   * Wait for a specified amount of time
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Generate realistic test data
   */
  static generateTestUserData() {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return {
      firstName,
      lastName,
      email: this.generateTestEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}`),
      phoneNumber: this.generateTestPhoneNumber(),
    };
  }

  /**
   * Generate test payment data
   */
  static generateTestPaymentData() {
    const amounts = [9.99, 19.99, 29.99, 49.99, 99.99, 199.99, 299.99];
    const currencies = ['USD', 'EUR', 'GBP'];
    const descriptions = [
      'Premium subscription',
      'Educational content',
      'Trading signals',
      'Market data access',
      'Advanced analytics',
    ];

    return {
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
    };
  }

  /**
   * Generate test trading data
   */
  static generateTestTradeData() {
    const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN', 'NVDA', 'META', 'NFLX'];
    const sides = ['buy', 'sell'];
    const orderTypes = ['market', 'limit', 'stop'];

    return {
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      side: sides[Math.floor(Math.random() * sides.length)],
      quantity: Math.floor(Math.random() * 100) + 1,
      orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
      price: Math.round((Math.random() * 500 + 50) * 100) / 100,
    };
  }

  /**
   * Validate response structure
   */
  static validateApiResponse(response: any, expectedFields: string[]): boolean {
    if (!response || !response.data) {
      return false;
    }

    return expectedFields.every(field => {
      const hasField = field.split('.').reduce((obj, key) => obj && obj[key], response.data);
      return hasField !== undefined && hasField !== null;
    });
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate JWT format
   */
  static isValidJWT(token: string): boolean {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    return jwtRegex.test(token);
  }

  /**
   * Generate test market data
   */
  static generateTestMarketData(symbol: string) {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: Math.round((basePrice + change) * 100) / 100,
      bid: Math.round((basePrice + change - 0.01) * 100) / 100,
      ask: Math.round((basePrice + change + 0.01) * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 10000,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / basePrice) * 10000) / 100,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clean up test data by pattern
   */
  static async cleanupTestData(pattern: string): Promise<void> {
    // This would implement cleanup logic for test data
    // For now, just log the cleanup pattern
    console.log(`Cleaning up test data matching pattern: ${pattern}`);
  }
}