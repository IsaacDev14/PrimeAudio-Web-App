"""
Notification Services
- Email (SMTP)
- SMS (Africa's Talking)
- In-app notifications

Replace placeholder values with your actual credentials
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional


class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "your-email@gmail.com")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "your-app-password")
        self.from_email = os.getenv("EMAIL_FROM", "noreply@primeaudio.co.ke")
        self.from_name = os.getenv("EMAIL_FROM_NAME", "Prime Audio Solutions")
    
    def send_email(
        self, 
        to: str, 
        subject: str, 
        body: str, 
        html_body: Optional[str] = None
    ) -> dict:
        """
        Send an email
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Plain text body
            html_body: Optional HTML body
            
        Returns:
            dict with success status
        """
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to
            
            # Add plain text version
            msg.attach(MIMEText(body, "plain"))
            
            # Add HTML version if provided
            if html_body:
                msg.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to, msg.as_string())
            
            return {"success": True, "message": "Email sent successfully"}
        except Exception as e:
            print(f"Email send error: {e}")
            return {"success": False, "error": str(e)}
    
    def send_order_confirmation(self, to: str, order_id: int, tracking_id: str, total: float) -> dict:
        """Send order confirmation email"""
        subject = f"Order Confirmed - {tracking_id}"
        
        body = f"""
Hello,

Thank you for your order at Prime Audio Solutions!

Order Details:
- Order ID: #{order_id}
- Tracking ID: {tracking_id}
- Total Amount: KSh {total:,.2f}

Your order is being reviewed and you will be notified once it's approved.

Track your order: https://primeaudio.co.ke/track-order?id={tracking_id}

Thank you for shopping with us!

Best regards,
Prime Audio Solutions Team
        """
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Prime Audio Solutions</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
                <h2 style="color: #1f2937;">Order Confirmed! 🎉</h2>
                <p>Thank you for your order!</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> #{order_id}</p>
                    <p><strong>Tracking ID:</strong> {tracking_id}</p>
                    <p><strong>Total Amount:</strong> KSh {total:,.2f}</p>
                </div>
                
                <p>Your order is being reviewed and you will be notified once it's approved.</p>
                
                <a href="https://primeaudio.co.ke/track-order?id={tracking_id}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px;">
                    Track Your Order
                </a>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                <p>Prime Audio Solutions - East Africa's Premier Music Store</p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to, subject, body, html_body)
    
    def send_order_status_update(self, to: str, tracking_id: str, status: str) -> dict:
        """Send order status update email"""
        status_messages = {
            "approved": "Your order has been approved and is being prepared.",
            "processing": "Your order is being processed.",
            "shipped": "Your order has been shipped!",
            "delivered": "Your order has been delivered. Enjoy!",
            "cancelled": "Your order has been cancelled."
        }
        
        subject = f"Order Update - {tracking_id}"
        message = status_messages.get(status, f"Your order status is now: {status}")
        
        body = f"""
Hello,

{message}

Tracking ID: {tracking_id}

Track your order: https://primeaudio.co.ke/track-order?id={tracking_id}

Best regards,
Prime Audio Solutions Team
        """
        
        return self.send_email(to, subject, body)


class SMSService:
    def __init__(self):
        self.username = os.getenv("AT_USERNAME", "sandbox")
        self.api_key = os.getenv("AT_API_KEY", "YOUR_API_KEY")
        self.sender_id = os.getenv("AT_SENDER_ID", "PRIMEAUDIO")
        
        # Initialize Africa's Talking
        try:
            import africastalking
            africastalking.initialize(self.username, self.api_key)
            self.sms = africastalking.SMS
            self.initialized = True
        except ImportError:
            print("Africa's Talking SDK not installed. SMS disabled.")
            self.initialized = False
    
    def send_sms(self, phone: str, message: str) -> dict:
        """
        Send an SMS
        
        Args:
            phone: Recipient phone number (format: +254XXXXXXXXX)
            message: Message content (max 160 chars for 1 SMS)
            
        Returns:
            dict with success status
        """
        if not self.initialized:
            return {"success": False, "error": "SMS service not initialized"}
        
        # Format phone number
        if phone.startswith("0"):
            phone = "+254" + phone[1:]
        elif not phone.startswith("+"):
            phone = "+" + phone
        
        try:
            response = self.sms.send(message, [phone], self.sender_id)
            return {"success": True, "response": response}
        except Exception as e:
            print(f"SMS send error: {e}")
            return {"success": False, "error": str(e)}
    
    def send_order_confirmation(self, phone: str, tracking_id: str, total: float) -> dict:
        """Send order confirmation SMS"""
        message = f"Prime Audio: Order confirmed! Tracking ID: {tracking_id}. Total: KSh {total:,.0f}. Track at primeaudio.co.ke/track-order"
        return self.send_sms(phone, message)
    
    def send_order_status_update(self, phone: str, tracking_id: str, status: str) -> dict:
        """Send order status update SMS"""
        status_messages = {
            "approved": "approved",
            "shipped": "shipped",
            "delivered": "delivered"
        }
        
        if status in status_messages:
            message = f"Prime Audio: Your order {tracking_id} has been {status_messages[status]}. Track at primeaudio.co.ke/track-order"
            return self.send_sms(phone, message)
        
        return {"success": False, "error": "Status not applicable for SMS"}


# Singleton instances
email_service = EmailService()
sms_service = SMSService()
