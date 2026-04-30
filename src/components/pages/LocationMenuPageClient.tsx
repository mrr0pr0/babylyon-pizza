"use client";

import { useEffect, useState } from "react";
import { CartSidebar } from "@/src/components/cart/CartSidebar";
import { MenuItemCard } from "@/src/components/menu/MenuItemCard";
import { ItemModal } from "@/src/components/menu/ItemModal";
import { useCartStore } from "@/src/lib/store/cart";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  fromPrice: number;
  category: string;
  location: string;
  allergens: string[];
}

interface LocationHour {
  day: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

interface MenuData {
  location: string;
  categories: Array<{
    category: string;
    items: MenuItem[];
  }>;
  hours: LocationHour[];
}

export function LocationMenuPageClient({ location }: { location: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, setLocation } = useCartStore();

  useEffect(() => {
    setLocation(location, true);
  }, [location, setLocation]);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch(`/api/menu?location=${location}`);
        const data = await response.json();
        setMenuData(data);
        // Set first category as default
        if (data.categories && data.categories.length > 0) {
          setSelectedCategory(data.categories[0].category);
        }
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [location]);

  if (loading || !menuData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[var(--color-muted)]">Laster meny...</p>
      </div>
    );
  }

  const visibleItems =
    menuData.categories
      .find((cat) => cat.category === selectedCategory)
      ?.items || [];

  const activeItem =
    menuData.categories
      .flatMap((cat) => cat.items)
      .find((item) => item.id === activeItemId) || null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
      <div className="space-y-4">
        <header className="sticky top-0 z-20 rounded-md border border-[var(--color-border)] bg-black/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-[var(--color-gold)]">
              Babylon {location}
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Telefon: +47 40 00 00 00
            </p>
          </div>

          {/* Display hours */}
          {menuData.hours && menuData.hours.length > 0 && (
            <div className="mt-3 rounded bg-black/50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--color-gold)]">
                Åpningstider
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-muted)]">
                {menuData.hours.map((hour) => (
                  <div key={hour.dayOfWeek} className="flex justify-between">
                    <span>{hour.day.substring(0, 3)}:</span>
                    <span>
                      {hour.openTime} - {hour.closeTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {menuData.categories.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setSelectedCategory(cat.category)}
                className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.12em] ${
                  selectedCategory === cat.category
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-black"
                    : "border-[var(--color-border)] text-[var(--color-muted)]"
                }`}
              >
                {cat.category}
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
              fromPrice={parseFloat(item.fromPrice.toString())}
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
          basePrice={parseFloat(activeItem.fromPrice.toString())}
          onClose={() => setActiveItemId(null)}
          onAddToCart={({ sauce, quantity }) => {
            addItem({
              id: `${activeItem.id}-${sauce}`,
              menuItemId: activeItem.id,
              name: activeItem.name,
              unitPrice: parseFloat(activeItem.fromPrice.toString()),
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
