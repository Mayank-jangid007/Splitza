"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/landing");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6C47FF] border-t-transparent"></div>
    </div>
  );
}

// The SDK Initialization: When the user clicks "Request to Join", your Next.js backend generates an official Order ID via Razorpay or Cashfree.The Gateway Overlay: The payment UI display opens an official, secure checkout script.On Mobile: It triggers a native mobile intent that automatically forces open their Google Pay or PhonePe app directly to your payment page.On Desktop: It opens an authenticated, live - monitored popup frame with a dynamic QR code.The Webhook Confirmation: The user enters their secret UPI PIN inside their trusted banking app.The second the bank approves the debit, the Razorpay server fires a highly secure, encrypted server - to - server notification(a Webhook Event) directly to your backend API route(/api/webhooks / payment).The Automatic Database Update: The moment your backend receives that webhook, it runs an atomic transaction: it shifts filledSeats by + 1, logs the user into PoolMembership, and updates the user's dashboard screen automatically using a live connection (like WebSockets or Server-Sent Events). The user never has to manually tell the website that they paid.