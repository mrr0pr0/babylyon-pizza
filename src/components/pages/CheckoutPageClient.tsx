"use client";

import { useState, useMemo } from "react";
import { CartSidebar } from "@/src/components/cart/CartSidebar";
import { StripePaymentForm } from "@/src/components/checkout/StripePaymentForm";
import { StripeProvider } from "@/src/components/checkout/StripeProvider";
import { useCartStore } from "@/src/lib/store/cart";

function CheckoutForm({ location }: { location: string }) {
  const [deliveryType, setDeliveryType] = useState<"henting" | "levering">(
    "henting",
  );
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // Customer form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  
  const { items, discountAmount } = useCartStore();
  
  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) -
      discountAmount,
    [discountAmount, items],
  );

  const handlePaymentSuccess = async () => {
    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      // Create order with customer data and cart items
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: parseInt(location), // location should be a number
          customer: {
            name,
            phone,
            email,
            address: deliveryType === "levering" ? address : null,
          },
          deliveryType,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            linePrice: item.unitPrice * item.quantity,
            modifiers: item.modifiers || {},
          })),
          total: Math.max(total, 0),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setOrderError(error.error || "Feil ved opprettelse av bestilling");
        setIsCreatingOrder(false);
        return;
      }

      // Order created successfully and SMS will be sent by the server
      setPaymentSucceeded(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Feil ved opprettelse av bestilling";
      setOrderError(message);
    } finally {
      setIsCreatingOrder(false);
    }
  };


  if (paymentSucceeded) {
    return (
      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
        <h2 className="font-display text-2xl uppercase tracking-[0.1em] text-[var(--color-gold)]">
          Betaling vellykket!
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Din ordre har blitt sendt. Du vil motta en SMS om estimert leveringstid.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
      <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h1 className="font-display text-4xl uppercase tracking-[0.1em]">
          Steg 2 av 3 - Kasse
        </h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Navn"
            className="rounded border border-[var(--color-border)] bg-black/25 px-3 py-2"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon"
            className="rounded border border-[var(--color-border)] bg-black/25 px-3 py-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-post"
            className="rounded border border-[var(--color-border)] bg-black/25 px-3 py-2 sm:col-span-2"
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setDeliveryType("henting")}
            className={`rounded-md px-4 py-2 text-xs uppercase tracking-[0.12em] ${
              deliveryType === "henting"
                ? "bg-[var(--color-gold)] text-black"
                : "bg-[var(--color-border)]"
            }`}
          >
            Henting
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType("levering")}
            className={`rounded-md px-4 py-2 text-xs uppercase tracking-[0.12em] ${
              deliveryType === "levering"
                ? "bg-[var(--color-gold)] text-black"
                : "bg-[var(--color-border)]"
            }`}
          >
            Levering
          </button>
        </div>
        {deliveryType === "levering" ? (
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Adresse"
            className="mt-3 w-full rounded border border-[var(--color-border)] bg-black/25 px-3 py-2"
          />
        ) : null}

        <div className="mt-6 border-t border-[var(--color-border)] pt-6">
          <h2 className="font-display text-2xl uppercase tracking-[0.1em]">
            Betaling
          </h2>
          {orderError && (
            <div className="mb-4 rounded bg-red-500/20 p-3 text-sm text-red-400">
              {orderError}
            </div>
          )}
          <StripePaymentForm
            amount={Math.max(total, 0)}
            onSuccess={handlePaymentSuccess}
            isLoading={isCreatingOrder}
          />
        </div>
      </section>

      <CartSidebar location={location} step={2} />
    </div>
  );
}

export function CheckoutPageClient({ location }: { location: string }) {
  return (
    <StripeProvider>
      <CheckoutForm location={location} />
    </StripeProvider>
  );
}
