"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { CartSidebar } from "@/src/components/cart/CartSidebar";
import { MenuItemCard } from "@/src/components/menu/MenuItemCard";
import { ItemModal } from "@/src/components/menu/ItemModal";
import { useCartStore } from "@/src/lib/store/cart";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  fromPrice: number;
  imageUrl?: string | null;
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
  const { addItem, setLocation, items, discountAmount } = useCartStore();
  
  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) -
      discountAmount,
    [discountAmount, items],
  );

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
    <>
    <div className="grid grid-cols-1 gap-6 pb-36 lg:grid-cols-[3fr_1fr]">
      <div className="space-y-4">
        <header className="sticky top-0 z-20 rounded-md border border-[var(--color-border)] bg-black/95 p-4 backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h1 className="font-display text-2xl uppercase tracking-[0.1em] text-[var(--color-gold)] sm:text-3xl md:text-4xl">
              Babylon {location}
            </h1>
            <p className="text-xs text-[var(--color-muted)] sm:text-sm">
              Telefon: +47 64 94 04 00  
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

        <div className="lg:hidden">
          <CartSidebar location={location} step={1} />
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <MenuItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              fromPrice={parseFloat(item.fromPrice.toString())}
              imageUrl={item.imageUrl}
              onSelect={setActiveItemId}
            />
          ))}
        </section>
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
    
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-border)] bg-black/90 px-4 py-4 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
          <p className="font-display text-lg uppercase tracking-[0.1em] text-white sm:text-xl">
            Totalt: kr {Math.max(total, 0)},-
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:w-auto">
            <Link
              href={`/${location}`}
              className="inline-flex w-full items-center justify-center rounded border border-[var(--color-border)] bg-black/60 px-4 py-3 text-sm uppercase tracking-[0.12em] text-white transition hover:bg-black sm:w-1/2"
            >
              Tilbake
            </Link>
            <Link
              href={`/${location}/checkout`}
              className="inline-flex w-full items-center justify-center rounded bg-[var(--color-gold)] px-4 py-3 text-sm uppercase tracking-[0.12em] text-black transition hover:bg-[#f5c200] sm:w-1/2"
            >
              Neste
            </Link>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
