"use client";

import { useMemo, useState } from "react";

type Option = {
  id: string;
  label: string;
  price: number;
};

type ItemModalProps = {
  open: boolean;
  name: string;
  description: string;
  allergens: string[];
  basePrice: number;
  imageUrl?: string | null;
  onClose: () => void;
  onAddToCart: (payload: {
    sauce: string;
    removed: string[];
    ekstra: string[];
    leggTil: string[];
    quantity: number;
    unitPrice: number;
  }) => void;
};

const sauceOptions: Option[] = [
  { id: "mild", label: "Mild", price: 0 },
  { id: "medium", label: "Medium", price: 0 },
  { id: "sterk", label: "Sterk", price: 0 },
  { id: "uten-saus", label: "Uten saus", price: 0 },
];

const removeOptions: Option[] = [
  { id: "r-tomat", label: "Tomat", price: 0 },
  { id: "r-lok", label: "Løk", price: 0 },
  { id: "r-agurk", label: "Agurk", price: 0 },
  { id: "r-isbergsalat", label: "Isbergsalat", price: 0 },
];

const ekstraOptions: Option[] = [
  { id: "e-tomat", label: "Tomat", price: 5 },
  { id: "e-isbergsalat", label: "Isbergsalat", price: 5 },
  { id: "e-agurk", label: "Agurk", price: 5 },
  { id: "e-jalapenos", label: "Jalapenos", price: 5 },
  { id: "e-lok", label: "Løk", price: 5 },
  { id: "e-ananas", label: "Ananas", price: 5 },
  { id: "e-revet-ost", label: "Revet ost", price: 15 },
  { id: "e-feta", label: "Feta", price: 15 },
  { id: "e-kjott", label: "Kjøtt", price: 30 },
];

const leggTilOptions: Option[] = [
  { id: "l-ekstra-kjott", label: "Ekstra Kjøtt", price: 35 },
  { id: "l-ekstra-feta", label: "Ekstra Feta", price: 20 },
  { id: "l-ekstra-ananas", label: "Ekstra Ananas", price: 15 },
  { id: "l-ekstra-revet-ost", label: "Ekstra revet øst", price: 20 },
  { id: "l-brus-05", label: "Brus 0.5", price: 35 },
  { id: "l-brus-15", label: "Brus 1.5", price: 55 },
  { id: "l-energi", label: "Energi brus", price: 40 },
];

type SectionProps = {
  title: string;
  required?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function Section({ title, required, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[var(--color-border)]/30 px-3 py-2"
      >
        <span className="flex items-center gap-2">
          <span className="font-display text-sm uppercase tracking-[0.1em]">
            {title}
          </span>
          {required ? (
            <span className="rounded bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
              Obligatorisk
            </span>
          ) : null}
        </span>
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open ? <div className="px-3 py-2">{children}</div> : null}
    </section>
  );
}

type RowProps = {
  label: string;
  price: number;
  checked: boolean;
  onChange: () => void;
  inputType: "radio" | "checkbox";
  name?: string;
};

function OptionRow({ label, price, checked, onChange, inputType, name }: RowProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between border-b border-[var(--color-border)]/40 py-2 last:border-b-0">
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-[var(--color-gold)]">kr {price},-</span>
      </div>
      <input
        type={inputType}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--color-gold)]"
      />
    </label>
  );
}

export function ItemModal({
  open,
  name,
  description,
  allergens,
  basePrice,
  imageUrl,
  onClose,
  onAddToCart,
}: ItemModalProps) {
  const [sauce, setSauce] = useState<string>("");
  const [removed, setRemoved] = useState<string[]>([]);
  const [ekstra, setEkstra] = useState<string[]>([]);
  const [leggTil, setLeggTil] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggle = (
    id: string,
    list: string[],
    setter: (v: string[]) => void,
  ) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const extrasTotal = useMemo(() => {
    const ek = ekstra.reduce(
      (sum, id) => sum + (ekstraOptions.find((o) => o.id === id)?.price ?? 0),
      0,
    );
    const lt = leggTil.reduce(
      (sum, id) => sum + (leggTilOptions.find((o) => o.id === id)?.price ?? 0),
      0,
    );
    return ek + lt;
  }, [ekstra, leggTil]);

  const unitPrice = basePrice + extrasTotal;
  const totalPrice = unitPrice * quantity;

  if (!open) return null;

  const handleAdd = () => {
    if (!sauce) return;
    onAddToCart({
      sauce,
      removed: removed.map(
        (id) => removeOptions.find((o) => o.id === id)?.label ?? id,
      ),
      ekstra: ekstra.map(
        (id) => ekstraOptions.find((o) => o.id === id)?.label ?? id,
      ),
      leggTil: leggTil.map(
        (id) => leggTilOptions.find((o) => o.id === id)?.label ?? id,
      ),
      quantity,
      unitPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
        {imageUrl && (
          <div className="h-48 w-full overflow-hidden rounded-t-md bg-[var(--color-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex items-start justify-between border-b border-[var(--color-border)] p-4">
          <div>
            <h3 className="font-display text-2xl uppercase tracking-[0.08em]">
              {name}
            </h3>
            <p className="text-sm text-[var(--color-muted)]">{description}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Allergener: {allergens.join(", ") || "Ingen oppgitt"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-sm text-[var(--color-muted)] hover:text-red-200 text-red-700"
          >
            Lukk
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Section title={`Velg Saus  VELG (1)`} required defaultOpen={true}>
            {sauceOptions.map((option) => (
              <OptionRow
                key={option.id}
                label={option.label}
                price={option.price}
                checked={sauce === option.label}
                onChange={() => setSauce(option.label)}
                inputType="radio"
                name="sauce"
              />
            ))}
          </Section>

          <Section title="Ta Bort" defaultOpen={false}>
            {removeOptions.map((option) => (
              <OptionRow
                key={option.id}
                label={option.label}
                price={option.price}
                checked={removed.includes(option.id)}
                onChange={() => toggle(option.id, removed, setRemoved)}
                inputType="checkbox"
              />
            ))}
          </Section>

          <Section title="Ekstra" defaultOpen={false}>
            {ekstraOptions.map((option) => (
              <OptionRow
                key={option.id}
                label={option.label}
                price={option.price}
                checked={ekstra.includes(option.id)}
                onChange={() => toggle(option.id, ekstra, setEkstra)}
                inputType="checkbox"
              />
            ))}
          </Section>

          <Section title="Legg Til" defaultOpen={false}>
            {leggTilOptions.map((option) => (
              <OptionRow
                key={option.id}
                label={option.label}
                price={option.price}
                checked={leggTil.includes(option.id)}
                onChange={() => toggle(option.id, leggTil, setLeggTil)}
                inputType="checkbox"
              />
            ))}
          </Section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="flex h-9 w-9 items-center justify-center rounded bg-[var(--color-danger,#c53030)] font-bold text-white"
            >
              -
            </button>
            <span className="min-w-6 text-center font-display text-lg">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="flex h-9 w-9 items-center justify-center rounded bg-[var(--color-success,#38a169)] font-bold text-white"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={!sauce}
            onClick={handleAdd}
            className="flex-1 rounded-md bg-[var(--color-gold)] px-4 py-2 font-display uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="flex items-center justify-between">
              <span>Velg</span>
              <span>kr {totalPrice},-</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}