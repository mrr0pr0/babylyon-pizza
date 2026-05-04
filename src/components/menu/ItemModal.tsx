"use client";

import { useEffect, useMemo, useState } from "react";

type Modifier = {
  id: number;
  type: string;
  label: string;
  priceDelta: number;
  isRequired: boolean;
};

type ItemModalProps = {
  open: boolean;
  name: string;
  description: string;
  allergens: string[];
  basePrice: number;
  modifiers: Modifier[];
  imageUrl?: string | null;
  onClose: () => void;
  onAddToCart: (payload: {
    modifiers: Record<string, string[]>;
    quantity: number;
    unitPrice: number;
    note?: string;
  }) => void;
};

const modifierTypeLabels: Record<string, string> = {
  sauce: "VELG SAUS",
  remove: "TA BORT",
  extra: "LEGG TIL",
  addon: "LEGG TIL",
};

const modifierTypeInfo: Record<string, string> = {
  sauce: "VELG (1)",
  remove: "",
  extra: "",
  addon: "",
};

const modifierTypeOrder = ["sauce", "remove", "extra", "addon"];

export function ItemModal({
  open,
  name,
  description,
  allergens,
  basePrice,
  modifiers,
  imageUrl,
  onClose,
  onAddToCart,
}: ItemModalProps) {
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, number[]>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    setSelectedModifiers({});
    setQuantity(1);
    setNote("");
  }, [modifiers]);

  const groupedModifiers = useMemo(() => {
    const groups: Record<string, Modifier[]> = {};

    modifiers.forEach((modifier) => {
      groups[modifier.type] = groups[modifier.type] || [];
      groups[modifier.type].push(modifier);
    });

    return Object.entries(groups)
      .sort(
        ([typeA], [typeB]) =>
          modifierTypeOrder.indexOf(typeA) - modifierTypeOrder.indexOf(typeB),
      )
      .reduce((acc, [type, items]) => {
        acc[type] = items;
        return acc;
      }, {} as Record<string, Modifier[]>);
  }, [modifiers]);

  const selectedLabels = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selectedModifiers).map(([type, ids]) => [
          type,
          ids
            .map((id) =>
              modifiers.find((modifier) => modifier.id === id)?.label,
            )
            .filter(Boolean) as string[],
        ]),
      ),
    [modifiers, selectedModifiers],
  );

  const selectedModifierTotal = useMemo(() => {
    return Object.values(selectedModifiers)
      .flat()
      .reduce((sum, modifierId) => {
        const modifier = modifiers.find((item) => item.id === modifierId);
        return sum + (modifier?.priceDelta ?? 0);
      }, 0);
  }, [modifiers, selectedModifiers]);

  const unitPrice = basePrice + selectedModifierTotal;
  const totalPrice = unitPrice * quantity;

  const isSelectionValid = useMemo(() => {
    return Object.entries(groupedModifiers).every(([type, items]) => {
      const requiredItems = items.filter((item) => item.isRequired);
      if (requiredItems.length === 0) {
        return true;
      }
      return (selectedModifiers[type] || []).length > 0;
    });
  }, [groupedModifiers, selectedModifiers]);

  const handleCheckboxChange = (type: string, modifierId: number) => {
    setSelectedModifiers((prev) => {
      const current = prev[type] || [];
      return {
        ...prev,
        [type]: current.includes(modifierId)
          ? current.filter((id) => id !== modifierId)
          : [...current, modifierId],
      };
    });
  };

  const handleRadioChange = (type: string, modifierId: number) => {
    setSelectedModifiers((prev) => ({
      ...prev,
      [type]: [modifierId],
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-xl rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h3 className="font-display text-3xl uppercase tracking-[0.08em]">
                {name}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-[var(--color-muted)]"
              >
                Lukk
              </button>
            </div>
          </div>
          {imageUrl ? (
            <div className="mt-4 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={name}
                className="h-48 w-full object-cover"
              />
            </div>
          ) : null}
          <p className="mt-4 text-sm text-[var(--color-muted)]">{description}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Allergener: {allergens.join(", ") || "Ingen oppgitt"}
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedModifiers).map(([type, items]) => {
            const title = modifierTypeLabels[type] || type;
            const footer = modifierTypeInfo[type] || "";
            const isRequired = items.some((modifier) => modifier.isRequired);

            return (
              <section key={type} className="space-y-3 rounded-md border border-[var(--color-border)] bg-black/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                  <div>
                    <p className="font-display text-lg uppercase tracking-[0.12em]">
                      {title}
                    </p>
                    {footer ? (
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                        {footer}
                      </p>
                    ) : null}
                  </div>
                  {isRequired ? (
                    <span className="rounded bg-[var(--color-gold)] px-2 py-1 text-xs uppercase text-black">
                      OBLIGATORISK
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {items.map((modifier) => {
                    const selected = (selectedModifiers[type] || []).includes(
                      modifier.id,
                    );
                    const showRadio = type === "sauce";

                    return (
                      <label
                        key={modifier.id}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium uppercase tracking-[0.06em]">
                            {modifier.label}
                          </p>
                          <p className="text-xs text-[var(--color-danger)]">
                            kr {modifier.priceDelta.toFixed(0)},-
                          </p>
                        </div>
                        <input
                          type={showRadio ? "radio" : "checkbox"}
                          name={type}
                          checked={selected}
                          onChange={() =>
                            showRadio
                              ? handleRadioChange(type, modifier.id)
                              : handleCheckboxChange(type, modifier.id)
                          }
                          className="h-5 w-5 accent-[var(--color-gold)]"
                        />
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="space-y-3">
          <label className="block text-sm uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Notat til kjøkkenet
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="F.eks. uten løk, ekstra saus eller allergier"
            className="h-24 w-full rounded border border-[var(--color-border)] bg-black/10 p-3 text-sm text-white"
          />
        </div>

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
            disabled={!isSelectionValid}
            onClick={() =>
              onAddToCart({
                modifiers: selectedLabels,
                quantity,
                unitPrice,
                note: note.trim() || undefined,
              })
            }
            className="rounded-md bg-[var(--color-gold)] px-4 py-2 font-display uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Legg til i ordre - kr {totalPrice},-
          </button>
        </div>
      </div>
    </div>
  );
}
