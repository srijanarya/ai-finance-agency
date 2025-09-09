"""
Email Service for AI Finance Agency
Handles email sending for authentication workflows
"""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from jinja2 import Template

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for authentication-related emails"""
    
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'localhost')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@ai-finance-agency.com')
        self.from_name = os.getenv('FROM_NAME', 'AI Finance Agency')
        self.base_url = os.getenv('BASE_URL', 'http://localhost:8000')
        
        # Email templates
        self.verification_template = self._get_verification_template()
        self.welcome_template = self._get_welcome_template()
        self.password_reset_template = self._get_password_reset_template()
    
    def send_verification_email(
        self,
        email: str,
        first_name: str,
        verification_token: str,
        tenant_name: str = "AI Finance Agency"
    ) -> bool:
        """
        Send email verification email
        
        Args:
            email: Recipient email address
            first_name: User's first name
            verification_token: Email verification token
            tenant_name: Organization name
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            subject = f"Welcome to {tenant_name} - Verify Your Email"
            verification_url = f"{self.base_url}/auth/verify-email?token={verification_token}"
            
            # Render HTML content
            html_content = self.verification_template.render(
                first_name=first_name,
                tenant_name=tenant_name,
                verification_url=verification_url,
                support_email=self.from_email
            )
            
            # Send email
            return self._send_email(
                to_email=email,
                subject=subject,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {email}: {e}")
            return False
    
    def send_welcome_email(
        self,
        email: str,
        first_name: str,
        tenant_name: str = "AI Finance Agency"
    ) -> bool:
        """
        Send welcome email after successful verification
        
        Args:
            email: Recipient email address
            first_name: User's first name
            tenant_name: Organization name
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            subject = f"Welcome to {tenant_name}!"
            dashboard_url = f"{self.base_url}/dashboard"
            
            # Render HTML content
            html_content = self.welcome_template.render(
                first_name=first_name,
                tenant_name=tenant_name,
                dashboard_url=dashboard_url,
                support_email=self.from_email
            )
            
            # Send email
            return self._send_email(
                to_email=email,
                subject=subject,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {email}: {e}")
            return False
    
    def send_password_reset_email(
        self,
        email: str,
        first_name: str,
        reset_token: str,
        tenant_name: str = "AI Finance Agency"
    ) -> bool:
        """
        Send password reset email
        
        Args:
            email: Recipient email address
            first_name: User's first name
            reset_token: Password reset token
            tenant_name: Organization name
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            subject = f"Reset Your {tenant_name} Password"
            reset_url = f"{self.base_url}/auth/reset-password?token={reset_token}"
            
            # Render HTML content
            html_content = self.password_reset_template.render(
                first_name=first_name,
                tenant_name=tenant_name,
                reset_url=reset_url,
                support_email=self.from_email
            )
            
            # Send email
            return self._send_email(
                to_email=email,
                subject=subject,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {email}: {e}")
            return False
    
    def _send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send email via SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email content
            text_content: Plain text content (optional)
            
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            # If SMTP not configured, log and return True for development
            if not self.smtp_user or not self.smtp_password:
                logger.warning(f"SMTP not configured. Email would be sent to {to_email}: {subject}")
                logger.info(f"Email content preview: {html_content[:200]}...")
                return True
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add plain text version if not provided
            if not text_content:
                text_content = self._html_to_text(html_content)
            
            # Attach parts
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    def _html_to_text(self, html_content: str) -> str:
        """Convert HTML to plain text"""
        # Simple HTML to text conversion
        import re
        text = re.sub('<[^<]+?>', '', html_content)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _get_verification_template(self) -> Template:
        """Get email verification template"""
        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Email Verification</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; }
                .button { 
                    display: inline-block; 
                    background: #3498db; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }
                .footer { background: #ecf0f1; padding: 20px; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{{ tenant_name }}</h1>
                </div>
                <div class="content">
                    <h2>Welcome, {{ first_name }}!</h2>
                    <p>Thank you for registering with {{ tenant_name }}. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                    
                    <a href="{{ verification_url }}" class="button">Verify Email Address</a>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p><a href="{{ verification_url }}">{{ verification_url }}</a></p>
                    
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    
                    <p>If you didn't create an account with {{ tenant_name }}, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Need help? Contact us at <a href="mailto:{{ support_email }}">{{ support_email }}</a></p>
                    <p>&copy; {{ tenant_name }}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return Template(template_str)
    
    def _get_welcome_template(self) -> Template:
        """Get welcome email template"""
        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Welcome</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; }
                .button { 
                    display: inline-block; 
                    background: #27ae60; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }
                .footer { background: #ecf0f1; padding: 20px; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{{ tenant_name }}</h1>
                    <h2>Welcome Aboard!</h2>
                </div>
                <div class="content">
                    <h2>Hi {{ first_name }},</h2>
                    <p>Your email has been successfully verified and your account is now active!</p>
                    
                    <p>You can now access all the features of {{ tenant_name }}:</p>
                    <ul>
                        <li>Personalized financial insights</li>
                        <li>Market analysis and trends</li>
                        <li>Portfolio tracking tools</li>
                        <li>Expert recommendations</li>
                    </ul>
                    
                    <a href="{{ dashboard_url }}" class="button">Go to Dashboard</a>
                    
                    <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                </div>
                <div class="footer">
                    <p>Need help? Contact us at <a href="mailto:{{ support_email }}">{{ support_email }}</a></p>
                    <p>&copy; {{ tenant_name }}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return Template(template_str)
    
    def _get_password_reset_template(self) -> Template:
        """Get password reset email template"""
        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Password Reset</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
                .content { background: #f8f9fa; padding: 30px; }
                .button { 
                    display: inline-block; 
                    background: #e74c3c; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }
                .footer { background: #ecf0f1; padding: 20px; font-size: 12px; text-align: center; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{{ tenant_name }}</h1>
                    <h2>Password Reset Request</h2>
                </div>
                <div class="content">
                    <h2>Hi {{ first_name }},</h2>
                    <p>We received a request to reset your password for your {{ tenant_name }} account.</p>
                    
                    <a href="{{ reset_url }}" class="button">Reset Password</a>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p><a href="{{ reset_url }}">{{ reset_url }}</a></p>
                    
                    <div class="warning">
                        <strong>Important:</strong>
                        <ul>
                            <li>This link will expire in 1 hour for security reasons</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your current password will remain unchanged until you create a new one</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>Need help? Contact us at <a href="mailto:{{ support_email }}">{{ support_email }}</a></p>
                    <p>&copy; {{ tenant_name }}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return Template(template_str)