"""
M-Pesa Daraja API Integration Service
Uses STK Push for mobile payments

Replace placeholder values with your actual Daraja API credentials:
- MPESA_CONSUMER_KEY
- MPESA_CONSUMER_SECRET
- MPESA_SHORTCODE
- MPESA_PASSKEY
- MPESA_CALLBACK_URL
"""

import httpx
import base64
from datetime import datetime
import os


class MpesaService:
    def __init__(self):
        self.consumer_key = os.getenv("MPESA_CONSUMER_KEY", "YOUR_CONSUMER_KEY")
        self.consumer_secret = os.getenv("MPESA_CONSUMER_SECRET", "YOUR_CONSUMER_SECRET")
        self.shortcode = os.getenv("MPESA_SHORTCODE", "174379")  # Sandbox shortcode
        self.passkey = os.getenv("MPESA_PASSKEY", "YOUR_PASSKEY")
        self.callback_url = os.getenv("MPESA_CALLBACK_URL", "https://yourdomain.com/api/mpesa/callback")
        
        # Use sandbox for development
        self.base_url = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
    
    def _get_access_token(self) -> str:
        """Get OAuth access token from Safaricom"""
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        credentials = base64.b64encode(
            f"{self.consumer_key}:{self.consumer_secret}".encode()
        ).decode()
        
        headers = {"Authorization": f"Basic {credentials}"}
        
        try:
            with httpx.Client() as client:
                response = client.get(url, headers=headers)
                response.raise_for_status()
                return response.json().get("access_token")
        except Exception as e:
            print(f"Error getting M-Pesa access token: {e}")
            return None
    
    def _get_password(self) -> tuple:
        """Generate password and timestamp for STK Push"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(
            f"{self.shortcode}{self.passkey}{timestamp}".encode()
        ).decode()
        return password, timestamp
    
    async def stk_push(self, phone: str, amount: float, order_id: int, description: str = "Order Payment") -> dict:
        """
        Initiate STK Push to customer's phone
        
        Args:
            phone: Customer phone number (format: 254XXXXXXXXX)
            amount: Amount to charge
            order_id: Order ID for reference
            description: Transaction description
            
        Returns:
            dict with CheckoutRequestID and ResponseCode
        """
        access_token = self._get_access_token()
        if not access_token:
            return {"success": False, "error": "Failed to get access token"}
        
        password, timestamp = self._get_password()
        
        # Format phone number
        if phone.startswith("0"):
            phone = "254" + phone[1:]
        elif phone.startswith("+"):
            phone = phone[1:]
        
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": self.shortcode,
            "PhoneNumber": phone,
            "CallBackURL": self.callback_url,
            "AccountReference": f"ORDER-{order_id}",
            "TransactionDesc": description
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload)
                result = response.json()
                
                if result.get("ResponseCode") == "0":
                    return {
                        "success": True,
                        "checkout_request_id": result.get("CheckoutRequestID"),
                        "merchant_request_id": result.get("MerchantRequestID"),
                        "message": "STK Push sent successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": result.get("errorMessage", "STK Push failed")
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def verify_payment(self, checkout_request_id: str) -> dict:
        """
        Check the status of an STK Push transaction
        
        Args:
            checkout_request_id: The CheckoutRequestID from stk_push response
            
        Returns:
            dict with payment status
        """
        access_token = self._get_access_token()
        if not access_token:
            return {"success": False, "error": "Failed to get access token"}
        
        password, timestamp = self._get_password()
        
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload)
                result = response.json()
                
                result_code = result.get("ResultCode")
                
                if result_code == "0":
                    return {
                        "success": True,
                        "paid": True,
                        "message": "Payment successful"
                    }
                elif result_code == "1032":
                    return {
                        "success": True,
                        "paid": False,
                        "message": "Transaction cancelled by user"
                    }
                else:
                    return {
                        "success": True,
                        "paid": False,
                        "message": result.get("ResultDesc", "Payment pending or failed")
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}


# Singleton instance
mpesa_service = MpesaService()
