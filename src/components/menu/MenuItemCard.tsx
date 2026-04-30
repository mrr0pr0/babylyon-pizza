"use client";

import { motion } from "framer-motion";

type MenuItemCardProps = {
  id: number;
  name: string;
  description: string;
  fromPrice: number;
  imageUrl?: string | null;
  onSelect: (itemId: number) => void;
};

export function MenuItemCard({
  id,
  name,
  description,
  fromPrice,
  imageUrl,
  onSelect,
}: MenuItemCardProps) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-gold)]/50"
    >
      <div className="h-40 w-full bg-[var(--color-border)]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <h3 className="font-display text-2xl uppercase tracking-[0.08em]">{name}</h3>
        <p className="line-clamp-2 text-sm text-[var(--color-muted)]">{description}</p>
        <div className="flex items-center justify-between">
          <p className="font-display text-xl uppercase tracking-[0.08em] text-[var(--color-gold)]">
            Fra kr {fromPrice},-
          </p>
          <button
            type="button"
            onClick={() => onSelect(id)}
            className="rounded-md bg-[var(--color-success)] px-4 py-2 font-display text-sm uppercase tracking-[0.14em] text-black"
          >
            Velg
          </button>
        </div>
      </div>
    </motion.article>
  );
}
