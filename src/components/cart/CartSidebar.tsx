"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StepIndicator } from "@/src/components/cart/StepIndicator";
import { useCartStore } from "@/src/lib/store/cart";

type CartSidebarProps = {
  location: string;
  step: 1 | 2 | 3;
};

export function CartSidebar({ location, step }: CartSidebarProps) {
  const [code, setCode] = useState("");
  const {
    items,
    discountAmount,
    clearCart,
    updateQty,
    removeItem,
    applyDiscount,
  } = useCartStore();
  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) -
      discountAmount,
    [discountAmount, items],
  );

  return (
    <aside className="sticky top-4 h-fit rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <StepIndicator step={step} />
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Din ordre er tom.</p>
        ) : null}
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded border border-[var(--color-border)] p-2"
          >
            <p className="font-display text-lg uppercase tracking-[0.08em]">
              {item.name}
            </p>
            {Object.entries(item.modifiers)
              .filter(([, values]) => values.length > 0)
              .map(([type, values]) => (
                <p key={type} className="mt-1 text-xs text-[var(--color-muted)]">
                  {type}: {values.join(", ")}
                </p>
              ))}
            {item.note ? (
              <p className="mt-1 text-xs italic text-[var(--color-muted)]">
                Notat: {item.note}
              </p>
            ) : null}
            <div className="mt-1 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQty(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-[var(--color-danger)]"
              >
                Slett
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Rabattkode"
            className="w-full rounded border border-[var(--color-border)] bg-black/20 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => applyDiscount(code, 50)}
            className="rounded bg-[var(--color-gold)] px-3 py-2 text-xs uppercase tracking-[0.12em] text-black"
          >
            Registrer
          </button>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]"
        >
          Tom handlekurv
        </button>
      </div>

      {step !== 1 && (
        <div className="mt-4 border-t border-[var(--color-border)] pt-4">
          <p className="font-display text-2xl uppercase tracking-[0.1em]">
            Totalt: kr {Math.max(total, 0)},-
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/${location}`}
              className="w-1/2 rounded bg-[var(--color-border)] px-3 py-2 text-center text-xs uppercase tracking-[0.12em]"
            >
              Tilbake
            </Link>
            {step === 2 ? (
              <button
                type="button"
                disabled
                className="w-1/2 cursor-not-allowed rounded bg-[var(--color-gold-dim)]/40 px-3 py-2 text-center text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]"
              >
                Betal forst
              </button>
            ) : (
              <Link
                href={`/${location}`}
                className="w-1/2 rounded bg-[var(--color-gold)] px-3 py-2 text-center text-xs uppercase tracking-[0.12em] text-black"
              >
                Ny ordre
              </Link>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
