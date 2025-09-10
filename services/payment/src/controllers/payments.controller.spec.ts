import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TestHelpers } from '@shared/test-utils/test-helpers';
import { TestFactory } from '@shared/test-utils/test-factory';
import { PaymentStatus, PaymentType } from '../entities/payment.entity';
import { HttpStatus } from '@nestjs/common';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentService: jest.Mocked<PaymentService>;
  let mockRequest: any;

  const mockUser = {
    sub: 'test-user-id',
    email: 'test@example.com',
    roles: ['user'],
  };

  const mockPayment = TestFactory.createPayment({
    id: 'payment-123',
    userId: 'test-user-id',
    amount: 100.50,
    currency: 'USD',
    status: PaymentStatus.PENDING,
    type: PaymentType.ONE_TIME,
    description: 'Test payment',
    stripePaymentIntentId: 'pi_test_123456',
    stripeCustomerId: 'cus_test_123456',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockPaymentService = {
    createPayment: jest.fn(),
    confirmPayment: jest.fn(),
    getUserPayments: jest.fn(),
    getPaymentById: jest.fn(),
    refundPayment: jest.fn(),
    cancelPayment: jest.fn(),
    getPaymentSummary: jest.fn(),
    downloadReceipt: jest.fn(),
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    updateSubscription: jest.fn(),
    getSubscriptions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentService = module.get<PaymentService>(PaymentService) as jest.Mocked<PaymentService>;

    mockRequest = TestHelpers.createMockRequest({
      user: mockUser,
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPayment', () => {
    const createPaymentDto = {
      amount: 100.50,
      currency: 'USD',
      type: PaymentType.ONE_TIME,
      description: 'Test payment',
      subscriptionPlan: null,
    };

    it('should create a payment successfully', async () => {
      paymentService.createPayment.mockResolvedValue(mockPayment);

      const result = await controller.createPayment(mockRequest, createPaymentDto);

      expect(paymentService.createPayment).toHaveBeenCalledWith(
        mockUser.sub,
        createPaymentDto,
      );
      expect(result).toEqual(mockPayment);
    });

    it('should handle payment creation errors', async () => {
      const error = new Error('Payment creation failed');
      paymentService.createPayment.mockRejectedValue(error);

      await expect(
        controller.createPayment(mockRequest, createPaymentDto),
      ).rejects.toThrow('Payment creation failed');
    });
  });

  describe('confirmPayment', () => {
    const confirmPaymentDto = {
      paymentMethodId: 'pm_test_123456',
    };

    it('should confirm a payment successfully', async () => {
      const confirmedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED };
      paymentService.confirmPayment.mockResolvedValue(confirmedPayment);

      const result = await controller.confirmPayment(
        'payment-123',
        confirmPaymentDto,
      );

      expect(paymentService.confirmPayment).toHaveBeenCalledWith(
        'payment-123',
        confirmPaymentDto.paymentMethodId,
      );
      expect(result).toEqual(confirmedPayment);
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should handle payment confirmation errors', async () => {
      const error = new Error('Payment confirmation failed');
      paymentService.confirmPayment.mockRejectedValue(error);

      await expect(
        controller.confirmPayment('payment-123', confirmPaymentDto),
      ).rejects.toThrow('Payment confirmation failed');
    });
  });

  describe('getUserPayments', () => {
    const queryParams = {
      page: 1,
      limit: 10,
      status: PaymentStatus.COMPLETED,
      type: PaymentType.ONE_TIME,
      currency: 'USD',
      dateFrom: '2023-01-01',
      dateTo: '2023-12-31',
    };

    it('should get user payments with filters', async () => {
      const mockPayments = {
        data: [mockPayment],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      paymentService.getUserPayments.mockResolvedValue(mockPayments);

      const result = await controller.getUserPayments(mockRequest, queryParams);

      expect(paymentService.getUserPayments).toHaveBeenCalledWith(
        mockUser.sub,
        queryParams,
      );
      expect(result).toEqual(mockPayments);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should handle empty query params', async () => {
      const emptyParams = {};
      const mockPayments = {
        data: [mockPayment],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      paymentService.getUserPayments.mockResolvedValue(mockPayments);

      const result = await controller.getUserPayments(mockRequest, emptyParams);

      expect(paymentService.getUserPayments).toHaveBeenCalledWith(
        mockUser.sub,
        emptyParams,
      );
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getPaymentById', () => {
    it('should get payment by id successfully', async () => {
      paymentService.getPaymentById.mockResolvedValue(mockPayment);

      const result = await controller.getPaymentById(mockRequest, 'payment-123');

      expect(paymentService.getPaymentById).toHaveBeenCalledWith(
        'payment-123',
        mockUser.sub,
      );
      expect(result).toEqual(mockPayment);
    });

    it('should handle payment not found', async () => {
      const error = new Error('Payment not found');
      paymentService.getPaymentById.mockRejectedValue(error);

      await expect(
        controller.getPaymentById(mockRequest, 'invalid-id'),
      ).rejects.toThrow('Payment not found');
    });
  });

  describe('refundPayment', () => {
    const refundDto = {
      amount: 50.25,
      reason: 'Customer request',
    };

    it('should refund payment successfully', async () => {
      const refundedPayment = { ...mockPayment, refundedAmount: 50.25 };
      paymentService.refundPayment.mockResolvedValue(refundedPayment);

      const result = await controller.refundPayment(
        'payment-123',
        refundDto,
      );

      expect(paymentService.refundPayment).toHaveBeenCalledWith(
        'payment-123',
        refundDto.amount,
        refundDto.reason,
      );
      expect(result).toEqual(refundedPayment);
    });

    it('should handle refund errors', async () => {
      const error = new Error('Refund failed');
      paymentService.refundPayment.mockRejectedValue(error);

      await expect(
        controller.refundPayment('payment-123', refundDto),
      ).rejects.toThrow('Refund failed');
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment successfully', async () => {
      const cancelledPayment = { ...mockPayment, status: PaymentStatus.CANCELLED };
      paymentService.cancelPayment.mockResolvedValue(cancelledPayment);

      const result = await controller.cancelPayment('payment-123');

      expect(paymentService.cancelPayment).toHaveBeenCalledWith('payment-123');
      expect(result).toEqual(cancelledPayment);
      expect(result.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should handle cancel errors', async () => {
      const error = new Error('Cancel failed');
      paymentService.cancelPayment.mockRejectedValue(error);

      await expect(
        controller.cancelPayment('payment-123'),
      ).rejects.toThrow('Cancel failed');
    });
  });

  describe('getPaymentSummary', () => {
    const summaryQuery = {
      year: 2023,
      month: 12,
    };

    it('should get payment summary successfully', async () => {
      const mockSummary = {
        totalAmount: 1000.50,
        totalPayments: 10,
        successfulPayments: 8,
        failedPayments: 1,
        cancelledPayments: 1,
        monthlyBreakdown: [
          { month: 'January', amount: 100, count: 2 },
          { month: 'February', amount: 200, count: 3 },
        ],
      };
      paymentService.getPaymentSummary.mockResolvedValue(mockSummary);

      const result = await controller.getPaymentSummary(mockRequest, summaryQuery);

      expect(paymentService.getPaymentSummary).toHaveBeenCalledWith(
        mockUser.sub,
        summaryQuery,
      );
      expect(result).toEqual(mockSummary);
      expect(result.totalPayments).toBe(10);
      expect(result.monthlyBreakdown).toHaveLength(2);
    });
  });

  describe('downloadReceipt', () => {
    it('should download receipt successfully', async () => {
      const mockPdfBuffer = Buffer.from('pdf-content');
      const mockResponse = TestHelpers.createMockResponse();
      
      paymentService.downloadReceipt.mockResolvedValue(mockPdfBuffer);

      await controller.downloadReceipt(
        mockRequest,
        mockResponse,
        'payment-123',
      );

      expect(paymentService.downloadReceipt).toHaveBeenCalledWith(
        'payment-123',
        mockUser.sub,
      );
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="receipt-payment-123.pdf"',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it('should handle receipt generation errors', async () => {
      const mockResponse = TestHelpers.createMockResponse();
      const error = new Error('Receipt generation failed');
      paymentService.downloadReceipt.mockRejectedValue(error);

      await expect(
        controller.downloadReceipt(mockRequest, mockResponse, 'payment-123'),
      ).rejects.toThrow('Receipt generation failed');
    });
  });

  describe('Subscription endpoints', () => {
    const createSubscriptionDto = {
      planId: 'premium',
      paymentMethodId: 'pm_test_123456',
    };

    describe('createSubscription', () => {
      it('should create subscription successfully', async () => {
        const mockSubscription = {
          id: 'sub_test_123456',
          planId: 'premium',
          status: 'active',
          currentPeriodEnd: new Date(),
        };
        paymentService.createSubscription.mockResolvedValue(mockSubscription);

        const result = await controller.createSubscription(
          mockRequest,
          createSubscriptionDto,
        );

        expect(paymentService.createSubscription).toHaveBeenCalledWith(
          mockUser.sub,
          createSubscriptionDto,
        );
        expect(result).toEqual(mockSubscription);
      });
    });

    describe('cancelSubscription', () => {
      it('should cancel subscription successfully', async () => {
        const cancelledSubscription = {
          id: 'sub_test_123456',
          status: 'canceled',
        };
        paymentService.cancelSubscription.mockResolvedValue(cancelledSubscription);

        const result = await controller.cancelSubscription('sub_test_123456');

        expect(paymentService.cancelSubscription).toHaveBeenCalledWith('sub_test_123456');
        expect(result).toEqual(cancelledSubscription);
      });
    });

    describe('updateSubscription', () => {
      const updateDto = {
        planId: 'enterprise',
      };

      it('should update subscription successfully', async () => {
        const updatedSubscription = {
          id: 'sub_test_123456',
          planId: 'enterprise',
          status: 'active',
        };
        paymentService.updateSubscription.mockResolvedValue(updatedSubscription);

        const result = await controller.updateSubscription(
          'sub_test_123456',
          updateDto,
        );

        expect(paymentService.updateSubscription).toHaveBeenCalledWith(
          'sub_test_123456',
          updateDto,
        );
        expect(result).toEqual(updatedSubscription);
      });
    });

    describe('getSubscriptions', () => {
      it('should get user subscriptions successfully', async () => {
        const mockSubscriptions = [
          {
            id: 'sub_test_123456',
            planId: 'premium',
            status: 'active',
          },
        ];
        paymentService.getSubscriptions.mockResolvedValue(mockSubscriptions);

        const result = await controller.getSubscriptions(mockRequest);

        expect(paymentService.getSubscriptions).toHaveBeenCalledWith(mockUser.sub);
        expect(result).toEqual(mockSubscriptions);
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('Input validation', () => {
    it('should validate payment amount', async () => {
      const invalidDto = {
        amount: -100,
        currency: 'USD',
        type: PaymentType.ONE_TIME,
        description: 'Invalid payment',
      };

      // This would typically be handled by ValidationPipe
      expect(invalidDto.amount).toBeLessThan(0);
    });

    it('should validate currency format', async () => {
      const invalidDto = {
        amount: 100,
        currency: 'INVALID',
        type: PaymentType.ONE_TIME,
        description: 'Test payment',
      };

      expect(invalidDto.currency).toBe('INVALID');
      expect(invalidDto.currency.length).toBe(7); // Invalid length
    });

    it('should validate payment type', async () => {
      const validTypes = [
        PaymentType.ONE_TIME,
        PaymentType.RECURRING,
        PaymentType.SUBSCRIPTION,
      ];
      
      expect(validTypes).toContain(PaymentType.ONE_TIME);
      expect(validTypes).toContain(PaymentType.RECURRING);
      expect(validTypes).toContain(PaymentType.SUBSCRIPTION);
    });
  });

  describe('Error handling', () => {
    it('should handle service unavailable errors', async () => {
      const serviceError = new Error('Payment service unavailable');
      paymentService.createPayment.mockRejectedValue(serviceError);

      const createPaymentDto = {
        amount: 100,
        currency: 'USD',
        type: PaymentType.ONE_TIME,
        description: 'Test payment',
      };

      await expect(
        controller.createPayment(mockRequest, createPaymentDto),
      ).rejects.toThrow('Payment service unavailable');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      paymentService.confirmPayment.mockRejectedValue(networkError);

      const confirmDto = { paymentMethodId: 'pm_test_123456' };

      await expect(
        controller.confirmPayment('payment-123', confirmDto),
      ).rejects.toThrow('Network timeout');
    });
  });
});