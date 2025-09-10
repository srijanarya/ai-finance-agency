import { DatabaseSetup } from './database-setup';
import { TestHelpers } from './test-helpers';

export interface TestUser {
  id?: number;
  email: string;
  password: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isVerified: boolean;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
}

export interface TestPayment {
  id?: number;
  userId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentId?: string;
}

export interface TestTrade {
  id?: number;
  userId: number;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  orderType: 'market' | 'limit' | 'stop';
}

export class TestDataGenerator {
  private dbSetup: DatabaseSetup;
  private generatedUsers: TestUser[] = [];
  private generatedPayments: TestPayment[] = [];
  private generatedTrades: TestTrade[] = [];
  
  constructor() {
    this.dbSetup = new DatabaseSetup();
  }
  
  async generateTestData(): Promise<void> {
    console.log('📊 Generating comprehensive test data...');
    
    // Generate test users
    await this.generateTestUsers();
    
    // Generate test payments
    await this.generateTestPayments();
    
    // Generate test trades
    await this.generateTestTrades();
    
    // Generate test subscriptions
    await this.generateTestSubscriptions();
    
    console.log('✅ Test data generation complete');
  }
  
  private async generateTestUsers(): Promise<void> {
    console.log('👥 Generating test users...');
    
    const userTypes = [
      { tier: 'basic', count: 10, verified: 0.8 },
      { tier: 'premium', count: 5, verified: 0.9 },
      { tier: 'enterprise', count: 2, verified: 1.0 },
    ];
    
    for (const userType of userTypes) {
      for (let i = 0; i < userType.count; i++) {
        const password = 'TestPassword123!';
        const passwordHash = await TestHelpers.hashPassword(password);
        const userData = TestHelpers.generateTestUserData();
        
        const user: TestUser = {
          email: userData.email,
          password,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          isVerified: Math.random() < userType.verified,
          subscriptionTier: userType.tier as any,
        };
        
        try {
          const userId = await this.dbSetup.createTestUser(user);
          user.id = userId;
          this.generatedUsers.push(user);
          
          console.log(`👤 Created test user: ${user.email} (${user.subscriptionTier})`);
        } catch (error) {
          console.warn(`⚠️ Failed to create user ${user.email}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Generated ${this.generatedUsers.length} test users`);
  }
  
  private async generateTestPayments(): Promise<void> {
    console.log('💳 Generating test payments...');
    
    const paymentMethods = ['stripe', 'paypal', 'bank_transfer'];
    const currencies = ['USD', 'EUR', 'GBP'];
    const statuses = ['completed', 'pending', 'failed'];
    
    for (const user of this.generatedUsers) {
      // Generate 1-3 payments per user
      const paymentCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < paymentCount; i++) {
        const paymentData = TestHelpers.generateTestPaymentData();
        
        const payment: TestPayment = {
          userId: user.id!,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: statuses[Math.floor(Math.random() * statuses.length)] as any,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          stripePaymentId: `test_${TestHelpers.generateUUID().replace(/-/g, '').substring(0, 24)}`,
        };
        
        try {
          const paymentId = await this.dbSetup.createTestPayment(payment);
          payment.id = paymentId;
          this.generatedPayments.push(payment);
          
          console.log(`💰 Created payment: $${payment.amount} for user ${user.email}`);
        } catch (error) {
          console.warn(`⚠️ Failed to create payment:`, error.message);
        }
      }
    }
    
    console.log(`✅ Generated ${this.generatedPayments.length} test payments`);
  }
  
  private async generateTestTrades(): Promise<void> {
    console.log('📈 Generating test trades...');
    
    const statuses = ['executed', 'pending', 'cancelled'];
    
    // Only generate trades for premium and enterprise users
    const tradingUsers = this.generatedUsers.filter(
      user => user.subscriptionTier !== 'basic'
    );
    
    for (const user of tradingUsers) {
      // Generate 2-8 trades per trading user
      const tradeCount = Math.floor(Math.random() * 7) + 2;
      
      for (let i = 0; i < tradeCount; i++) {
        const tradeData = TestHelpers.generateTestTradeData();
        
        const trade: TestTrade = {
          userId: user.id!,
          symbol: tradeData.symbol,
          side: tradeData.side as any,
          quantity: tradeData.quantity,
          price: tradeData.price,
          status: statuses[Math.floor(Math.random() * statuses.length)] as any,
          orderType: tradeData.orderType as any,
        };
        
        try {
          const tradeId = await this.dbSetup.createTestTrade(trade);
          trade.id = tradeId;
          this.generatedTrades.push(trade);
          
          console.log(`📊 Created trade: ${trade.side} ${trade.quantity} ${trade.symbol} for ${user.email}`);
        } catch (error) {
          console.warn(`⚠️ Failed to create trade:`, error.message);
        }
      }
    }
    
    console.log(`✅ Generated ${this.generatedTrades.length} test trades`);
  }
  
  private async generateTestSubscriptions(): Promise<void> {
    console.log('📋 Generating test subscriptions...');
    
    const plans = {
      basic: ['Basic Plan'],
      premium: ['Premium Plan', 'Premium Plus'],
      enterprise: ['Enterprise Plan', 'Enterprise Pro'],
    };
    
    for (const user of this.generatedUsers) {
      const userPlans = plans[user.subscriptionTier];
      const planName = userPlans[Math.floor(Math.random() * userPlans.length)];
      
      const subscription = {
        userId: user.id!,
        planName,
        status: 'active',
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
        endDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in next year
        autoRenew: Math.random() > 0.2, // 80% auto-renew
      };
      
      try {
        await this.dbSetup.createTestSubscription(subscription);
        console.log(`📋 Created subscription: ${planName} for ${user.email}`);
      } catch (error) {
        console.warn(`⚠️ Failed to create subscription:`, error.message);
      }
    }
    
    console.log(`✅ Generated subscriptions for all users`);
  }
  
  // Getters for accessing generated data in tests
  getTestUsers(): TestUser[] {
    return this.generatedUsers;
  }
  
  getTestPayments(): TestPayment[] {
    return this.generatedPayments;
  }
  
  getTestTrades(): TestTrade[] {
    return this.generatedTrades;
  }
  
  getTestUserByTier(tier: 'basic' | 'premium' | 'enterprise'): TestUser | undefined {
    return this.generatedUsers.find(user => user.subscriptionTier === tier);
  }
  
  getVerifiedTestUser(): TestUser | undefined {
    return this.generatedUsers.find(user => user.isVerified);
  }
  
  getUnverifiedTestUser(): TestUser | undefined {
    return this.generatedUsers.find(user => !user.isVerified);
  }
  
  generateRandomUser(): TestUser {
    const userData = TestHelpers.generateTestUserData();
    const password = 'TestPassword123!';
    
    return {
      email: userData.email,
      password,
      passwordHash: '', // Will be hashed when creating
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      isVerified: false,
      subscriptionTier: 'basic',
    };
  }
  
  generateRandomPaymentData() {
    return TestHelpers.generateTestPaymentData();
  }
  
  generateRandomTradeData() {
    return TestHelpers.generateTestTradeData();
  }
}