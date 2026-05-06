// src/hooks/useRazorpay.ts
// Loads the Razorpay SDK script lazily, creates an order, and opens the checkout modal

import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      on: (event: string, callback: (response: { error: { description: string } }) => void) => void;
      open: () => void;
    };
  }
}

interface UseRazorpayOptions {
  tenantId: string;
  onSuccess?: (paymentId: string, orderId: string) => void;
  onError?: (error: string) => void;
}

export function useRazorpay({ tenantId, onSuccess, onError }: UseRazorpayOptions) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lazily load Razorpay checkout.js
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (window.Razorpay) {
      // Small timeout to avoid synchronous setState in effect body warning
      const timeout = setTimeout(() => setSdkReady(true), 0);
      return () => clearTimeout(timeout);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => console.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);
  }, []);

  const openCheckout = useCallback(
    async (planId: "starter" | "growth" | "agency") => {
      if (!sdkReady) {
        onError?.("Payment SDK not ready. Please refresh and try again.");
        return;
      }
      setLoading(true);

      try {
        // 1. Create order on server
        const res = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, tenantId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create order");

        // 2. Open Razorpay modal
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: "ChatBot SaaS",
          description: `${data.planName} Plan — Monthly`,
          order_id: data.orderId,
          prefill: {
            name: data.tenantName,
            email: data.tenantEmail,
          },
          theme: { color: "#FF6B00" },       // saffron — matches your brand
          modal: {
            ondismiss: () => {
              setLoading(false);
              onError?.("Payment was cancelled.");
            },
          },
          handler: (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            // Payment captured — webhook will activate the plan in Supabase
            setLoading(false);
            onSuccess?.(response.razorpay_payment_id, response.razorpay_order_id);
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: { error: { description: string } }) => {
          setLoading(false);
          onError?.(response.error?.description ?? "Payment failed.");
        });
        rzp.open();
      } catch (err: unknown) {
        const error = err as { message?: string };
        setLoading(false);
        onError?.(error.message ?? "Something went wrong.");
      }
    },
    [sdkReady, tenantId, onSuccess, onError]
  );

  return { openCheckout, loading, sdkReady };
}
