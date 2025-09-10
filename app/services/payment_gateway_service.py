"""
Payment Gateway Integration Service for AI Finance Agency
Provides abstraction layer for multiple payment gateways (Razorpay, Stripe, Mock)
"""

import hashlib
import hmac
import json
import random
import secrets
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, Optional, List, Tuple
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from database.models.payment_models import (
    PaymentGateway, PaymentMethodType, TransactionStatus,
    CardBrand, TransactionType
)


class PaymentGatewayInterface(ABC):
    """
    Abstract interface for payment gateways
    Defines common methods that all payment gateways must implement
    """
    
    @abstractmethod
    def create_order(
        self,
        amount: Decimal,
        currency: str,
        customer_id: str,
        order_id: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create payment order"""
        pass
    
    @abstractmethod
    def capture_payment(
        self,
        payment_id: str,
        amount: Decimal,
        currency: str
    ) -> Dict[str, Any]:
        """Capture authorized payment"""
        pass
    
    @abstractmethod
    def refund_payment(
        self,
        payment_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Refund payment"""
        pass
    
    @abstractmethod
    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get payment status"""
        pass
    
    @abstractmethod
    def verify_webhook_signature(
        self,
        payload: str,
        signature: str,
        secret: str
    ) -> bool:
        """Verify webhook signature"""
        pass
    
    @abstractmethod
    def process_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook payload"""
        pass


class RazorpayGateway(PaymentGatewayInterface):
    """
    Razorpay payment gateway integration
    Handles Indian payment methods (UPI, Cards, NetBanking, Wallets)
    """
    
    def __init__(self, api_key: str, api_secret: str, webhook_secret: str):
        """
        Initialize Razorpay gateway
        
        Args:
            api_key: Razorpay API key
            api_secret: Razorpay API secret
            webhook_secret: Webhook signature secret
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.webhook_secret = webhook_secret
        self.base_url = "https://api.razorpay.com/v1"
        
        # Setup HTTP session with retry strategy
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        self.session.auth = (self.api_key, self.api_secret)
    
    def create_order(
        self,
        amount: Decimal,
        currency: str,
        customer_id: str,
        order_id: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create Razorpay order
        
        Args:
            amount: Amount in smallest currency unit (paise for INR)
            currency: Currency code (INR)
            customer_id: Customer identifier
            order_id: Internal order ID
            description: Order description
            metadata: Additional metadata
            
        Returns:
            Order creation response
        """
        # Convert amount to paise (Razorpay expects amount in paise)
        amount_paise = int(amount * 100)
        
        payload = {
            "amount": amount_paise,
            "currency": currency,
            "receipt": order_id,
            "notes": {
                "customer_id": customer_id,
                "internal_order_id": order_id,
                "description": description,
                **(metadata or {})
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/orders",
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            order_data = response.json()
            
            return {
                "success": True,
                "order_id": order_data["id"],
                "amount": amount,
                "currency": order_data["currency"],
                "status": order_data["status"],
                "created_at": order_data["created_at"],
                "checkout_url": f"https://checkout.razorpay.com/v1/checkout.js",
                "key": self.api_key,
                "raw_response": order_data
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Order creation failed: {str(e)}",
                "error_type": "network_error"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}",
                "error_type": "unknown_error"
            }
    
    def capture_payment(
        self,
        payment_id: str,
        amount: Decimal,
        currency: str
    ) -> Dict[str, Any]:
        """
        Capture Razorpay payment
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to capture
            currency: Currency code
            
        Returns:
            Capture response
        """
        amount_paise = int(amount * 100)
        
        payload = {
            "amount": amount_paise,
            "currency": currency
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/payments/{payment_id}/capture",
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            payment_data = response.json()
            
            return {
                "success": True,
                "payment_id": payment_data["id"],
                "amount": Decimal(payment_data["amount"]) / 100,
                "currency": payment_data["currency"],
                "status": payment_data["status"],
                "method": payment_data.get("method"),
                "captured_at": payment_data.get("captured_at"),
                "raw_response": payment_data
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Payment capture failed: {str(e)}",
                "error_type": "network_error"
            }
    
    def refund_payment(
        self,
        payment_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Refund Razorpay payment
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to refund (full refund if None)
            reason: Refund reason
            
        Returns:
            Refund response
        """
        payload = {}
        
        if amount:
            payload["amount"] = int(amount * 100)
        
        if reason:
            payload["notes"] = {"reason": reason}
        
        try:
            response = self.session.post(
                f"{self.base_url}/payments/{payment_id}/refund",
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            refund_data = response.json()
            
            return {
                "success": True,
                "refund_id": refund_data["id"],
                "payment_id": refund_data["payment_id"],
                "amount": Decimal(refund_data["amount"]) / 100,
                "currency": refund_data["currency"],
                "status": refund_data["status"],
                "created_at": refund_data["created_at"],
                "raw_response": refund_data
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Refund failed: {str(e)}",
                "error_type": "network_error"
            }
    
    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Get Razorpay payment status
        
        Args:
            payment_id: Razorpay payment ID
            
        Returns:
            Payment status response
        """
        try:
            response = self.session.get(
                f"{self.base_url}/payments/{payment_id}",
                timeout=30
            )
            response.raise_for_status()
            
            payment_data = response.json()
            
            return {
                "success": True,
                "payment_id": payment_data["id"],
                "amount": Decimal(payment_data["amount"]) / 100,
                "currency": payment_data["currency"],
                "status": payment_data["status"],
                "method": payment_data.get("method"),
                "email": payment_data.get("email"),
                "contact": payment_data.get("contact"),
                "created_at": payment_data["created_at"],
                "raw_response": payment_data
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Status check failed: {str(e)}",
                "error_type": "network_error"
            }
    
    def verify_webhook_signature(
        self,
        payload: str,
        signature: str,
        secret: str
    ) -> bool:
        """
        Verify Razorpay webhook signature
        
        Args:
            payload: Webhook payload
            signature: Webhook signature
            secret: Webhook secret
            
        Returns:
            Verification result
        """
        try:
            expected_signature = hmac.new(
                secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception:
            return False
    
    def process_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process Razorpay webhook
        
        Args:
            payload: Webhook payload
            
        Returns:
            Processed webhook data
        """
        event = payload.get("event")
        entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        
        return {
            "event_type": event,
            "payment_id": entity.get("id"),
            "order_id": entity.get("order_id"),
            "amount": Decimal(entity.get("amount", 0)) / 100,
            "currency": entity.get("currency"),
            "status": entity.get("status"),
            "method": entity.get("method"),
            "email": entity.get("email"),
            "contact": entity.get("contact"),
            "created_at": entity.get("created_at"),
            "raw_payload": payload
        }


class MockGateway(PaymentGatewayInterface):
    """
    Mock payment gateway for testing and development
    Simulates payment flow without actual payment processing
    """
    
    def __init__(self):
        """Initialize mock gateway"""
        self.success_rate = 0.9  # 90% success rate
        self.orders = {}  # In-memory order storage
        self.payments = {}  # In-memory payment storage
    
    def create_order(
        self,
        amount: Decimal,
        currency: str,
        customer_id: str,
        order_id: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create mock order
        
        Args:
            amount: Order amount
            currency: Currency code
            customer_id: Customer ID
            order_id: Internal order ID
            description: Order description
            metadata: Additional metadata
            
        Returns:
            Mock order response
        """
        mock_order_id = f"order_mock_{secrets.token_hex(8)}"
        
        order_data = {
            "id": mock_order_id,
            "amount": amount,
            "currency": currency,
            "customer_id": customer_id,
            "internal_order_id": order_id,
            "description": description,
            "status": "created",
            "created_at": int(datetime.utcnow().timestamp()),
            "metadata": metadata or {}
        }
        
        self.orders[mock_order_id] = order_data
        
        return {
            "success": True,
            "order_id": mock_order_id,
            "amount": amount,
            "currency": currency,
            "status": "created",
            "created_at": order_data["created_at"],
            "checkout_url": f"https://mock-gateway.example.com/checkout/{mock_order_id}",
            "key": "mock_key_123",
            "raw_response": order_data
        }
    
    def capture_payment(
        self,
        payment_id: str,
        amount: Decimal,
        currency: str
    ) -> Dict[str, Any]:
        """
        Capture mock payment
        
        Args:
            payment_id: Mock payment ID
            amount: Amount to capture
            currency: Currency code
            
        Returns:
            Mock capture response
        """
        # Simulate success/failure
        if random.random() > self.success_rate:
            return {
                "success": False,
                "error": "Payment capture failed",
                "error_type": "payment_failed",
                "error_code": "CAPTURE_ERROR"
            }
        
        payment_data = {
            "id": payment_id,
            "amount": amount,
            "currency": currency,
            "status": "captured",
            "method": random.choice(["card", "upi", "netbanking", "wallet"]),
            "captured_at": int(datetime.utcnow().timestamp())
        }
        
        self.payments[payment_id] = payment_data
        
        return {
            "success": True,
            "payment_id": payment_id,
            "amount": amount,
            "currency": currency,
            "status": "captured",
            "method": payment_data["method"],
            "captured_at": payment_data["captured_at"],
            "raw_response": payment_data
        }
    
    def refund_payment(
        self,
        payment_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Mock payment refund
        
        Args:
            payment_id: Mock payment ID
            amount: Refund amount
            reason: Refund reason
            
        Returns:
            Mock refund response
        """
        # Check if payment exists
        payment = self.payments.get(payment_id)
        if not payment:
            return {
                "success": False,
                "error": "Payment not found",
                "error_type": "payment_not_found"
            }
        
        refund_amount = amount or payment["amount"]
        mock_refund_id = f"rfnd_mock_{secrets.token_hex(8)}"
        
        refund_data = {
            "id": mock_refund_id,
            "payment_id": payment_id,
            "amount": refund_amount,
            "currency": payment["currency"],
            "status": "processed",
            "reason": reason,
            "created_at": int(datetime.utcnow().timestamp())
        }
        
        return {
            "success": True,
            "refund_id": mock_refund_id,
            "payment_id": payment_id,
            "amount": refund_amount,
            "currency": payment["currency"],
            "status": "processed",
            "created_at": refund_data["created_at"],
            "raw_response": refund_data
        }
    
    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Get mock payment status
        
        Args:
            payment_id: Mock payment ID
            
        Returns:
            Mock payment status
        """
        payment = self.payments.get(payment_id)
        if not payment:
            # Generate mock payment for testing
            payment = {
                "id": payment_id,
                "amount": Decimal("1000.00"),
                "currency": "INR",
                "status": random.choice(["created", "authorized", "captured", "failed"]),
                "method": random.choice(["card", "upi", "netbanking", "wallet"]),
                "email": "test@example.com",
                "contact": "+919876543210",
                "created_at": int(datetime.utcnow().timestamp())
            }
            self.payments[payment_id] = payment
        
        return {
            "success": True,
            "payment_id": payment["id"],
            "amount": payment["amount"],
            "currency": payment["currency"],
            "status": payment["status"],
            "method": payment["method"],
            "email": payment.get("email"),
            "contact": payment.get("contact"),
            "created_at": payment["created_at"],
            "raw_response": payment
        }
    
    def verify_webhook_signature(
        self,
        payload: str,
        signature: str,
        secret: str
    ) -> bool:
        """
        Mock webhook signature verification
        
        Args:
            payload: Webhook payload
            signature: Webhook signature
            secret: Webhook secret
            
        Returns:
            Always True for mock
        """
        # For mock gateway, always return True
        return True
    
    def process_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process mock webhook
        
        Args:
            payload: Webhook payload
            
        Returns:
            Processed mock webhook data
        """
        return {
            "event_type": payload.get("event", "payment.captured"),
            "payment_id": payload.get("payment_id", f"pay_mock_{secrets.token_hex(8)}"),
            "order_id": payload.get("order_id", f"order_mock_{secrets.token_hex(8)}"),
            "amount": Decimal(payload.get("amount", "1000.00")),
            "currency": payload.get("currency", "INR"),
            "status": payload.get("status", "captured"),
            "method": payload.get("method", "upi"),
            "email": payload.get("email", "test@example.com"),
            "contact": payload.get("contact", "+919876543210"),
            "created_at": int(datetime.utcnow().timestamp()),
            "raw_payload": payload
        }


class PaymentGatewayService:
    """
    Main payment gateway service that provides abstraction over multiple gateways
    Handles gateway selection, routing, and failover
    """
    
    def __init__(self):
        """Initialize payment gateway service"""
        self.gateways = {}
        self.default_gateway = PaymentGateway.MOCK
        
        # Initialize mock gateway by default
        self.gateways[PaymentGateway.MOCK] = MockGateway()
    
    def configure_razorpay(
        self,
        api_key: str,
        api_secret: str,
        webhook_secret: str
    ):
        """
        Configure Razorpay gateway
        
        Args:
            api_key: Razorpay API key
            api_secret: Razorpay API secret
            webhook_secret: Webhook secret
        """
        self.gateways[PaymentGateway.RAZORPAY] = RazorpayGateway(
            api_key, api_secret, webhook_secret
        )
    
    def set_default_gateway(self, gateway: PaymentGateway):
        """
        Set default payment gateway
        
        Args:
            gateway: Gateway to set as default
        """
        if gateway in self.gateways:
            self.default_gateway = gateway
        else:
            raise ValueError(f"Gateway {gateway} not configured")
    
    def get_gateway(self, gateway: Optional[PaymentGateway] = None) -> PaymentGatewayInterface:
        """
        Get payment gateway instance
        
        Args:
            gateway: Specific gateway to get (uses default if None)
            
        Returns:
            Gateway instance
        """
        gateway_type = gateway or self.default_gateway
        
        if gateway_type not in self.gateways:
            raise ValueError(f"Gateway {gateway_type} not configured")
        
        return self.gateways[gateway_type]
    
    def create_order(
        self,
        amount: Decimal,
        currency: str,
        customer_id: str,
        order_id: str,
        description: str,
        gateway: Optional[PaymentGateway] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create payment order
        
        Args:
            amount: Order amount
            currency: Currency code
            customer_id: Customer ID
            order_id: Internal order ID
            description: Order description
            gateway: Specific gateway to use
            metadata: Additional metadata
            
        Returns:
            Order creation response
        """
        gateway_instance = self.get_gateway(gateway)
        
        result = gateway_instance.create_order(
            amount=amount,
            currency=currency,
            customer_id=customer_id,
            order_id=order_id,
            description=description,
            metadata=metadata
        )
        
        # Add gateway information to response
        result["gateway"] = gateway or self.default_gateway
        
        return result
    
    def capture_payment(
        self,
        payment_id: str,
        amount: Decimal,
        currency: str,
        gateway: Optional[PaymentGateway] = None
    ) -> Dict[str, Any]:
        """
        Capture payment
        
        Args:
            payment_id: Payment ID
            amount: Amount to capture
            currency: Currency code
            gateway: Specific gateway to use
            
        Returns:
            Capture response
        """
        gateway_instance = self.get_gateway(gateway)
        
        result = gateway_instance.capture_payment(
            payment_id=payment_id,
            amount=amount,
            currency=currency
        )
        
        result["gateway"] = gateway or self.default_gateway
        
        return result
    
    def refund_payment(
        self,
        payment_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None,
        gateway: Optional[PaymentGateway] = None
    ) -> Dict[str, Any]:
        """
        Refund payment
        
        Args:
            payment_id: Payment ID
            amount: Amount to refund
            reason: Refund reason
            gateway: Specific gateway to use
            
        Returns:
            Refund response
        """
        gateway_instance = self.get_gateway(gateway)
        
        result = gateway_instance.refund_payment(
            payment_id=payment_id,
            amount=amount,
            reason=reason
        )
        
        result["gateway"] = gateway or self.default_gateway
        
        return result
    
    def get_payment_status(
        self,
        payment_id: str,
        gateway: Optional[PaymentGateway] = None
    ) -> Dict[str, Any]:
        """
        Get payment status
        
        Args:
            payment_id: Payment ID
            gateway: Specific gateway to use
            
        Returns:
            Payment status response
        """
        gateway_instance = self.get_gateway(gateway)
        
        result = gateway_instance.get_payment_status(payment_id)
        result["gateway"] = gateway or self.default_gateway
        
        return result
    
    def verify_webhook_signature(
        self,
        payload: str,
        signature: str,
        secret: str,
        gateway: PaymentGateway
    ) -> bool:
        """
        Verify webhook signature
        
        Args:
            payload: Webhook payload
            signature: Webhook signature
            secret: Webhook secret
            gateway: Gateway that sent the webhook
            
        Returns:
            Verification result
        """
        gateway_instance = self.get_gateway(gateway)
        
        return gateway_instance.verify_webhook_signature(
            payload=payload,
            signature=signature,
            secret=secret
        )
    
    def verify_razorpay_signature(self, payload: str, signature: str) -> bool:
        """
        Verify Razorpay webhook signature using configured secret
        
        Args:
            payload: Webhook payload
            signature: Webhook signature
            
        Returns:
            Verification result
        """
        if PaymentGateway.RAZORPAY not in self.gateways:
            return False
        
        gateway = self.gateways[PaymentGateway.RAZORPAY]
        return gateway.verify_webhook_signature(
            payload=payload,
            signature=signature,
            secret=gateway.webhook_secret
        )
    
    def verify_stripe_signature(self, payload: str, signature: str) -> bool:
        """
        Verify Stripe webhook signature using configured secret
        
        Args:
            payload: Webhook payload
            signature: Webhook signature from Stripe-Signature header
            
        Returns:
            Verification result
        """
        # For now, return True as Stripe integration is placeholder
        # In production, implement proper Stripe webhook signature verification
        # using stripe.Webhook.construct_event() or similar
        return True
    
    def process_webhook(
        self,
        payload: Dict[str, Any],
        gateway: PaymentGateway
    ) -> Dict[str, Any]:
        """
        Process webhook payload
        
        Args:
            payload: Webhook payload
            gateway: Gateway that sent the webhook
            
        Returns:
            Processed webhook data
        """
        gateway_instance = self.get_gateway(gateway)
        
        result = gateway_instance.process_webhook(payload)
        result["gateway"] = gateway
        
        return result
    
    def get_available_gateways(self) -> List[PaymentGateway]:
        """
        Get list of available gateways
        
        Returns:
            List of configured gateways
        """
        return list(self.gateways.keys())
    
    def is_gateway_available(self, gateway: PaymentGateway) -> bool:
        """
        Check if gateway is available
        
        Args:
            gateway: Gateway to check
            
        Returns:
            Availability status
        """
        return gateway in self.gateways


# Singleton instance
payment_gateway_service = PaymentGatewayService()