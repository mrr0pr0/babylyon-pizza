"use client";

import { useState } from "react";
import { CartSidebar } from "@/src/components/cart/CartSidebar";

export function CheckoutPageClient({ location }: { location: string }) {
  const [deliveryType, setDeliveryType] = useState<"henting" | "levering">(
    "henting",
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
      <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h1 className="font-display text-4xl uppercase tracking-[0.1em]">
          Steg 2 av 3 - Kasse
        </h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Navn"
            className="rounded border border-[var(--color-border)] bg-black/25 px-3 py-2"
          />
          <input
            placeholder="Telefon"
            className="rounded border border-[var(--color-border)] bg-black/25 px-3 py-2"
          />
          <input
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
            placeholder="Adresse"
            className="mt-3 w-full rounded border border-[var(--color-border)] bg-black/25 px-3 py-2"
          />
        ) : null}
      </section>

      <CartSidebar location={location} step={2} />
    </div>
  );
}
