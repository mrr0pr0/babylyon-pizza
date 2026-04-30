"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

type StripePaymentFormProps = {
  amount: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
};

export function StripePaymentForm({
  amount,
  onSuccess,
  onError,
  isLoading = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe har ikke lastet enda");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const { error: methodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement)!,
        });

      if (methodError) {
        setError(methodError.message || "Betalingsfeil");
        onError?.(methodError.message || "Betalingsfeil");
        setLoading(false);
        return;
      }

      // Call your backend to create payment intent
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Betalingen mislyktes");
        onError?.(data.error || "Betalingen mislyktes");
        setLoading(false);
        return;
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: paymentMethod.id,
        });

      if (confirmError) {
        setError(confirmError.message || "Betalingen mislyktes");
        onError?.(confirmError.message || "Betalingen mislyktes");
      } else if (paymentIntent.status === "succeeded") {
        setLoading(false);
        onSuccess?.(paymentIntent.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Noe gikk galt";
      setError(message);
      onError?.(message);
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  const isFormDisabled = loading || isLoading || !stripe;

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="rounded border border-[var(--color-border)] bg-black/25 p-3">
        <CardElement
          options={{
            style: {
              base: {
                color: "#ffffff",
                fontSize: "14px",
                "::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                },
              },
              invalid: {
                color: "#ef4444",
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="rounded bg-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full rounded bg-[var(--color-gold)] px-4 py-2 text-xs uppercase tracking-[0.12em] text-black disabled:opacity-50"
      >
        {loading ? "Behandler betaling..." : isLoading ? "Oppretter bestilling..." : "Betal nå"}
      </button>
    </form>
  );
}
