"use client";

import { useMemo, useState } from "react";

type Modifier = {
  id: number;
  label: string;
  priceDelta: number;
};

type ItemModalProps = {
  open: boolean;
  name: string;
  description: string;
  allergens: string[];
  basePrice: number;
  onClose: () => void;
  onAddToCart: (payload: { sauce: string; quantity: number }) => void;
};

const sauceOptions: Modifier[] = [
  { id: 1, label: "Mild", priceDelta: 0 },
  { id: 2, label: "Medium", priceDelta: 0 },
  { id: 3, label: "Sterk", priceDelta: 0 },
  { id: 4, label: "Uten saus", priceDelta: 0 },
];

export function ItemModal({
  open,
  name,
  description,
  allergens,
  basePrice,
  onClose,
  onAddToCart,
}: ItemModalProps) {
  const [sauce, setSauce] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const totalPrice = useMemo(() => basePrice * quantity, [basePrice, quantity]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-xl rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="font-display text-3xl uppercase tracking-[0.08em]">{name}</h3>
            <p className="text-sm text-[var(--color-muted)]">{description}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Allergener: {allergens.join(", ") || "Ingen oppgitt"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-[var(--color-muted)]">
            Lukk
          </button>
        </div>

        <section className="space-y-2">
          <p className="font-display text-lg uppercase tracking-[0.08em]">
            Velg saus <span className="rounded bg-[var(--color-gold)] px-2 py-1 text-black">Obligatorisk</span>
          </p>
          {sauceOptions.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="sauce"
                value={option.label}
                checked={sauce === option.label}
                onChange={() => setSauce(option.label)}
              />
              {option.label}
            </label>
          ))}
        </section>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="rounded border border-[var(--color-border)] px-3 py-1"
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="rounded border border-[var(--color-border)] px-3 py-1"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={!sauce}
            onClick={() => onAddToCart({ sauce, quantity })}
            className="rounded-md bg-[var(--color-gold)] px-4 py-2 font-display uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Legg til i ordre - kr {totalPrice},-
          </button>
        </div>
      </div>
    </div>
  );
}
