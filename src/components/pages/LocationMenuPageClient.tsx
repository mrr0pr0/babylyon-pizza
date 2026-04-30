"use client";

import { useEffect, useState } from "react";
import { CartSidebar } from "@/src/components/cart/CartSidebar";
import { MenuItemCard } from "@/src/components/menu/MenuItemCard";
import { ItemModal } from "@/src/components/menu/ItemModal";
import { categoryNames, mockMenuItems } from "@/src/lib/mock-data";
import { useCartStore } from "@/src/lib/store/cart";

export function LocationMenuPageClient({ location }: { location: string }) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categoryNames)[number]>("Kebab");
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const { addItem, setLocation } = useCartStore();

  useEffect(() => {
    setLocation(location, true);
  }, [location, setLocation]);

  const visibleItems = mockMenuItems.filter(
    (item) => item.location === location && item.category === selectedCategory,
  );
  const activeItem = mockMenuItems.find((item) => item.id === activeItemId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
      <div className="space-y-4">
        <header className="sticky top-0 z-20 rounded-md border border-[var(--color-border)] bg-black/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-[var(--color-gold)]">
              Babylon {location}
            </h1>
            <p className="text-sm text-[var(--color-muted)]">Telefon: +47 40 00 00 00</p>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categoryNames.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.12em] ${
                  selectedCategory === category
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-black"
                    : "border-[var(--color-border)] text-[var(--color-muted)]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <MenuItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              fromPrice={item.fromPrice}
              onSelect={setActiveItemId}
            />
          ))}
        </section>

        <div className="lg:hidden">
          <CartSidebar location={location} step={1} />
        </div>
      </div>
      <div className="hidden lg:block">
        <CartSidebar location={location} step={1} />
      </div>

      {activeItem ? (
        <ItemModal
          open
          name={activeItem.name}
          description={activeItem.description}
          allergens={activeItem.allergens}
          basePrice={activeItem.fromPrice}
          onClose={() => setActiveItemId(null)}
          onAddToCart={({ sauce, quantity }) => {
            addItem({
              id: `${activeItem.id}-${sauce}`,
              menuItemId: activeItem.id,
              name: activeItem.name,
              unitPrice: activeItem.fromPrice,
              quantity,
              modifiers: { sauce: [sauce] },
            });
            setActiveItemId(null);
          }}
        />
      ) : null}
    </div>
  );
}
