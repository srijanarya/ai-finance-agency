"""
Database models for AI Finance Agency
"""

from .auth_models import (
    User,
    Tenant,
    UserRole,
    UserStatus,
    UserSession,
    PasswordResetToken,
    UserPermission,
    AuditLog,
    AuditAction,
    PermissionType
)

from .profile_models import (
    UserProfile,
    KYCDocument,
    KYCStatus,
    AddressVerification,
    IncomeBracket,
    KYCDocumentType,
    KYCVerificationStatus,
    AddressVerificationMethod
)

from .payment_models import (
    Wallet,
    PaymentMethod,
    Transaction,
    PaymentWebhook,
    WithdrawalRequest,
    PaymentMethodType,
    CardBrand,
    TransactionType,
    TransactionCategory,
    TransactionStatus,
    WithdrawalStatus,
    PaymentGateway
)

from .signal_models import (
    SignalProvider,
    TradingSignal,
    SignalSubscription,
    SignalPerformance,
    UserSignalPreferences,
    SignalAnalytics,
    SignalBacktest,
    SignalType,
    SignalPriority,
    SignalStatus,
    AssetClass,
    SubscriptionTier,
    SignalSource
)

__all__ = [
    # Auth models
    'User',
    'Tenant', 
    'UserRole',
    'UserStatus',
    'UserSession',
    'PasswordResetToken',
    'UserPermission',
    'AuditLog',
    'AuditAction',
    'PermissionType',
    # Profile models
    'UserProfile',
    'KYCDocument',
    'KYCStatus',
    'AddressVerification',
    'IncomeBracket',
    'KYCDocumentType',
    'KYCVerificationStatus',
    'AddressVerificationMethod',
    # Payment models
    'Wallet',
    'PaymentMethod',
    'Transaction',
    'PaymentWebhook',
    'WithdrawalRequest',
    'PaymentMethodType',
    'CardBrand',
    'TransactionType',
    'TransactionCategory',
    'TransactionStatus',
    'WithdrawalStatus',
    'PaymentGateway',
    # Signal models
    'SignalProvider',
    'TradingSignal',
    'SignalSubscription',
    'SignalPerformance',
    'UserSignalPreferences',
    'SignalAnalytics',
    'SignalBacktest',
    'SignalType',
    'SignalPriority',
    'SignalStatus',
    'AssetClass',
    'SubscriptionTier',
    'SignalSource'
]