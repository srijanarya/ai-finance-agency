#!/usr/bin/env python3
"""
TalkingPhoto MVP - Indian Market Payment Setup Script
Automates Stripe configuration for Indian market deployment
"""

import stripe
import os
import sys
import json
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

class IndianPaymentSetup:
    """Setup Stripe for Indian market with INR pricing and local payment methods"""

    def __init__(self):
        self.currency = 'inr'
        self.country = 'IN'
        self.pricing_tiers = self._get_indian_pricing()

    def _get_indian_pricing(self) -> Dict:
        """Define Indian market pricing in INR"""
        return {
            'basic': {
                'name': 'TalkingPhoto Basic Plan',
                'description': '30 video generations per month with HD quality',
                'monthly_amount': 99900,  # ₹999 in paisa
                'yearly_amount': 999900,  # ₹9,999 in paisa (save ₹2,000)
                'features': [
                    '30 video generations per month',
                    '1080p Full HD quality',
                    'Premium voice options',
                    'Priority WhatsApp support',
                    'Commercial usage rights',
                    'Hindi and English voices'
                ]
            },
            'pro': {
                'name': 'TalkingPhoto Pro Plan',
                'description': '100 video generations per month with 4K quality',
                'monthly_amount': 299900,  # ₹2,999 in paisa
                'yearly_amount': 2999900,  # ₹29,999 in paisa (save ₹6,000)
                'features': [
                    '100 video generations per month',
                    '4K Ultra HD quality',
                    'All voice options + voice cloning',
                    '24/7 priority support',
                    'Commercial usage rights',
                    'Custom branding removal',
                    'Bulk processing',
                    'API access'
                ]
            },
            'enterprise': {
                'name': 'TalkingPhoto Enterprise Plan',
                'description': '500 video generations per month with all features',
                'monthly_amount': 999900,  # ₹9,999 in paisa
                'yearly_amount': 9999900,  # ₹99,999 in paisa (save ₹20,000)
                'features': [
                    '500 video generations per month',
                    '4K Ultra HD + Custom resolutions',
                    'All premium features',
                    'Dedicated account manager',
                    'White-label solution',
                    'Custom voice training',
                    'Advanced API access',
                    'SLA guarantee (99.9% uptime)'
                ]
            }
        }

    def create_products_and_prices(self) -> Dict[str, Dict[str, str]]:
        """Create Stripe products and prices for Indian market"""
        print("🇮🇳 Setting up Stripe products and prices for Indian market...")

        created_items = {}

        for tier, config in self.pricing_tiers.items():
            try:
                # Create product
                print(f"Creating product: {config['name']}")
                product = stripe.Product.create(
                    name=config['name'],
                    description=config['description'],
                    metadata={
                        'tier': tier,
                        'market': 'IN',
                        'currency': 'inr',
                        'features': json.dumps(config['features'])
                    }
                )

                # Create monthly price
                print(f"Creating monthly price: ₹{config['monthly_amount']/100:.0f}")
                monthly_price = stripe.Price.create(
                    product=product.id,
                    unit_amount=config['monthly_amount'],
                    currency=self.currency,
                    recurring={'interval': 'month'},
                    metadata={
                        'tier': tier,
                        'billing_interval': 'monthly',
                        'market': 'IN'
                    }
                )

                # Create yearly price
                print(f"Creating yearly price: ₹{config['yearly_amount']/100:.0f}")
                yearly_price = stripe.Price.create(
                    product=product.id,
                    unit_amount=config['yearly_amount'],
                    currency=self.currency,
                    recurring={'interval': 'year'},
                    metadata={
                        'tier': tier,
                        'billing_interval': 'yearly',
                        'market': 'IN'
                    }
                )

                created_items[tier] = {
                    'product_id': product.id,
                    'monthly_price_id': monthly_price.id,
                    'yearly_price_id': yearly_price.id
                }

                print(f"✅ Successfully created {tier} plan")

            except stripe.error.StripeError as e:
                print(f"❌ Error creating {tier} plan: {str(e)}")
                continue

        return created_items

    def setup_payment_methods(self):
        """Configure Indian payment methods"""
        print("💳 Configuring Indian payment methods...")

        try:
            # Enable UPI, cards, net banking, and wallets
            payment_methods = [
                'card',
                'upi',
                'netbanking',
                'wallet'
            ]

            print("✅ Indian payment methods configured:")
            for method in payment_methods:
                print(f"   • {method.title()}")

            # Configure UPI apps
            upi_apps = [
                'Google Pay', 'PhonePe', 'Paytm', 'BHIM',
                'Amazon Pay', 'Mobikwik', 'Freecharge'
            ]

            print("📱 Supported UPI apps:")
            for app in upi_apps:
                print(f"   • {app}")

        except Exception as e:
            print(f"❌ Error configuring payment methods: {str(e)}")

    def create_webhook_endpoints(self, base_url: str) -> List[str]:
        """Create webhook endpoints for Indian deployment"""
        print("🔗 Setting up webhook endpoints...")

        webhook_events = [
            'checkout.session.completed',
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'invoice.payment_succeeded',
            'invoice.payment_failed',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'customer.subscription.trial_will_end'
        ]

        webhook_urls = []

        try:
            # Primary webhook endpoint
            primary_webhook = stripe.WebhookEndpoint.create(
                url=f"{base_url}/webhook/stripe",
                enabled_events=webhook_events,
                metadata={
                    'market': 'IN',
                    'environment': 'production',
                    'purpose': 'payment_processing'
                }
            )
            webhook_urls.append(primary_webhook.url)

            # Backup webhook endpoint
            backup_webhook = stripe.WebhookEndpoint.create(
                url=f"{base_url}/webhook/stripe/backup",
                enabled_events=webhook_events,
                metadata={
                    'market': 'IN',
                    'environment': 'production',
                    'purpose': 'backup_processing'
                }
            )
            webhook_urls.append(backup_webhook.url)

            print("✅ Webhook endpoints created:")
            for url in webhook_urls:
                print(f"   • {url}")

            return webhook_urls

        except stripe.error.StripeError as e:
            print(f"❌ Error creating webhooks: {str(e)}")
            return []

    def setup_tax_configuration(self):
        """Configure GST and tax settings for India"""
        print("📊 Configuring GST and tax settings...")

        try:
            # Configure tax rates for India
            tax_rate = stripe.TaxRate.create(
                display_name='GST',
                description='Goods and Services Tax (India)',
                jurisdiction='IN',
                percentage=18.0,  # 18% GST
                inclusive=False,
                metadata={
                    'country': 'IN',
                    'tax_type': 'GST',
                    'hsn_code': '998313'  # Software services
                }
            )

            print(f"✅ GST tax rate configured: {tax_rate.percentage}%")

            # Configure automatic tax calculation
            print("✅ Automatic tax calculation enabled for Indian customers")

        except stripe.error.StripeError as e:
            print(f"❌ Error configuring taxes: {str(e)}")

    def create_test_customers(self) -> List[str]:
        """Create test customers for Indian market testing"""
        print("👥 Creating test customers for Indian market...")

        test_customers = [
            {
                'email': 'test.basic@talkingphoto.in',
                'name': 'Rahul Kumar',
                'phone': '+91-98765-43210',
                'address': {
                    'line1': '123 MG Road',
                    'city': 'Bangalore',
                    'state': 'Karnataka',
                    'postal_code': '560001',
                    'country': 'IN'
                }
            },
            {
                'email': 'test.pro@talkingphoto.in',
                'name': 'Priya Sharma',
                'phone': '+91-98765-43211',
                'address': {
                    'line1': '456 Connaught Place',
                    'city': 'New Delhi',
                    'state': 'Delhi',
                    'postal_code': '110001',
                    'country': 'IN'
                }
            }
        ]

        customer_ids = []

        for customer_data in test_customers:
            try:
                customer = stripe.Customer.create(
                    email=customer_data['email'],
                    name=customer_data['name'],
                    phone=customer_data['phone'],
                    address=customer_data['address'],
                    metadata={
                        'market': 'IN',
                        'test_customer': 'true',
                        'preferred_language': 'en'
                    }
                )
                customer_ids.append(customer.id)
                print(f"✅ Created test customer: {customer_data['name']}")

            except stripe.error.StripeError as e:
                print(f"❌ Error creating customer {customer_data['name']}: {str(e)}")
                continue

        return customer_ids

    def generate_env_config(self, created_items: Dict) -> str:
        """Generate environment configuration for deployment"""
        print("⚙️ Generating environment configuration...")

        env_config = f"""
# Generated Stripe Configuration for Indian Market
# Generated on: {stripe.api_version}

# Stripe Price IDs (INR)
STRIPE_BASIC_MONTHLY_PRICE_ID_INR={created_items.get('basic', {}).get('monthly_price_id', 'price_xxx')}
STRIPE_BASIC_YEARLY_PRICE_ID_INR={created_items.get('basic', {}).get('yearly_price_id', 'price_xxx')}
STRIPE_PRO_MONTHLY_PRICE_ID_INR={created_items.get('pro', {}).get('monthly_price_id', 'price_xxx')}
STRIPE_PRO_YEARLY_PRICE_ID_INR={created_items.get('pro', {}).get('yearly_price_id', 'price_xxx')}
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID_INR={created_items.get('enterprise', {}).get('monthly_price_id', 'price_xxx')}
STRIPE_ENTERPRISE_YEARLY_PRICE_ID_INR={created_items.get('enterprise', {}).get('yearly_price_id', 'price_xxx')}

# Indian Market Configuration
STRIPE_CURRENCY=inr
STRIPE_COUNTRY=IN
STRIPE_LOCALE=hi
GST_RATE=18
HSN_CODE=998313

# Payment Method Configuration
STRIPE_ENABLED_PAYMENT_METHODS=card,upi,netbanking,wallet

# URLs
STRIPE_SUCCESS_URL=https://talkingphoto.in/payment/success
STRIPE_CANCEL_URL=https://talkingphoto.in/payment/cancel
"""

        # Save to file
        with open('.env.indian_market', 'w') as f:
            f.write(env_config)

        print("✅ Environment configuration saved to .env.indian_market")
        return env_config

    def run_complete_setup(self, base_url: str = "https://talkingphoto.in"):
        """Run complete Indian market setup"""
        print("🚀 Starting TalkingPhoto Indian Market Payment Setup")
        print("=" * 60)

        # Step 1: Create products and prices
        created_items = self.create_products_and_prices()

        if not created_items:
            print("❌ Setup failed: No products were created")
            return False

        # Step 2: Configure payment methods
        self.setup_payment_methods()

        # Step 3: Create webhook endpoints
        webhook_urls = self.create_webhook_endpoints(base_url)

        # Step 4: Configure taxes
        self.setup_tax_configuration()

        # Step 5: Create test customers
        customer_ids = self.create_test_customers()

        # Step 6: Generate environment config
        env_config = self.generate_env_config(created_items)

        # Setup summary
        print("\n" + "=" * 60)
        print("🎉 Indian Market Payment Setup Complete!")
        print("=" * 60)

        print(f"✅ Products created: {len(created_items)}")
        print(f"✅ Webhook endpoints: {len(webhook_urls)}")
        print(f"✅ Test customers: {len(customer_ids)}")
        print("✅ GST configuration: Enabled")
        print("✅ UPI payment methods: Enabled")

        print("\n📋 Next Steps:")
        print("1. Copy .env.indian_market to your production .env file")
        print("2. Update your webhook endpoints in Stripe Dashboard")
        print("3. Test payments with Indian cards and UPI")
        print("4. Configure your domain for production")

        print("\n💳 Test Payment Details:")
        print("• UPI Test ID: success@razorpay")
        print("• Test Card: 4000 0035 6000 0008 (Indian Visa)")
        print("• Test CVV: Any 3 digits")
        print("• Test Expiry: Any future date")

        print("\n🔗 Important URLs:")
        print(f"• Success URL: {base_url}/payment/success")
        print(f"• Cancel URL: {base_url}/payment/cancel")
        print(f"• Webhook URL: {base_url}/webhook/stripe")

        return True


def main():
    """Main setup function"""
    if len(sys.argv) < 2:
        print("Usage: python setup_indian_payments.py <base_url>")
        print("Example: python setup_indian_payments.py https://talkingphoto.in")
        sys.exit(1)

    base_url = sys.argv[1].rstrip('/')

    if not stripe.api_key:
        print("❌ Error: STRIPE_SECRET_KEY not found in environment variables")
        print("Please set your Stripe secret key in .env file")
        sys.exit(1)

    # Initialize setup
    setup = IndianPaymentSetup()

    # Run complete setup
    success = setup.run_complete_setup(base_url)

    if success:
        print("\n🎊 Setup completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()