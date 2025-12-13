"""
Paystack Payment Integration Service
For card payments (Visa, Mastercard)

Replace placeholder values with your actual Paystack credentials:
- PAYSTACK_SECRET_KEY
- PAYSTACK_PUBLIC_KEY
"""

import httpx
import os
from typing import Optional


class PaystackService:
    def __init__(self):
        self.secret_key = os.getenv("PAYSTACK_SECRET_KEY", "sk_test_YOUR_SECRET_KEY")
        self.public_key = os.getenv("PAYSTACK_PUBLIC_KEY", "pk_test_YOUR_PUBLIC_KEY")
        self.base_url = "https://api.paystack.co"
    
    def _get_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
    
    async def initialize_transaction(
        self, 
        email: str, 
        amount: float, 
        reference: str,
        callback_url: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> dict:
        """
        Initialize a payment transaction
        
        Args:
            email: Customer email
            amount: Amount in KES (will be converted to kobo)
            reference: Unique transaction reference
            callback_url: URL to redirect after payment
            metadata: Additional data to attach to transaction
            
        Returns:
            dict with authorization_url and reference
        """
        url = f"{self.base_url}/transaction/initialize"
        
        # Paystack uses kobo (smallest currency unit)
        # For KES, multiply by 100
        amount_in_kobo = int(amount * 100)
        
        payload = {
            "email": email,
            "amount": amount_in_kobo,
            "reference": reference,
            "currency": "KES",  # Kenyan Shillings
            "metadata": metadata or {}
        }
        
        if callback_url:
            payload["callback_url"] = callback_url
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url, 
                    headers=self._get_headers(), 
                    json=payload
                )
                result = response.json()
                
                if result.get("status"):
                    data = result.get("data", {})
                    return {
                        "success": True,
                        "authorization_url": data.get("authorization_url"),
                        "access_code": data.get("access_code"),
                        "reference": data.get("reference")
                    }
                else:
                    return {
                        "success": False,
                        "error": result.get("message", "Failed to initialize transaction")
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def verify_transaction(self, reference: str) -> dict:
        """
        Verify a transaction status
        
        Args:
            reference: Transaction reference
            
        Returns:
            dict with transaction status and details
        """
        url = f"{self.base_url}/transaction/verify/{reference}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self._get_headers())
                result = response.json()
                
                if result.get("status"):
                    data = result.get("data", {})
                    status = data.get("status")
                    
                    return {
                        "success": True,
                        "paid": status == "success",
                        "status": status,
                        "amount": data.get("amount", 0) / 100,  # Convert from kobo
                        "reference": data.get("reference"),
                        "customer_email": data.get("customer", {}).get("email"),
                        "paid_at": data.get("paid_at"),
                        "channel": data.get("channel"),
                        "message": "Transaction verified"
                    }
                else:
                    return {
                        "success": False,
                        "paid": False,
                        "error": result.get("message", "Verification failed")
                    }
        except Exception as e:
            return {"success": False, "paid": False, "error": str(e)}
    
    async def get_transaction_list(self, per_page: int = 50, page: int = 1) -> dict:
        """Get list of transactions"""
        url = f"{self.base_url}/transaction?perPage={per_page}&page={page}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self._get_headers())
                result = response.json()
                
                if result.get("status"):
                    return {
                        "success": True,
                        "transactions": result.get("data", []),
                        "meta": result.get("meta", {})
                    }
                else:
                    return {"success": False, "error": result.get("message")}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_public_key(self) -> str:
        """Get public key for frontend integration"""
        return self.public_key


# Singleton instance
paystack_service = PaystackService()
