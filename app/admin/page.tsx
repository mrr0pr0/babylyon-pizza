"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type AdminOrderItem = {
  quantity: number;
  name: string;
};

type AdminOrder = {
  id: number;
  status: "mottatt" | "forberedes" | "klar" | "levert";
  delivery_type: "henting" | "levering";
  total: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  location_slug: string;
  items: AdminOrderItem[];
};

const STATUS_OPTIONS: AdminOrder["status"][] = [
  "mottatt",
  "forberedes",
  "klar",
  "levert",
];

const STATUS_LABELS: Record<AdminOrder["status"], string> = {
  mottatt: "Mottatt",
  forberedes: "Forberedes",
  klar: "Klar",
  levert: "Levert",
};

const DELIVERY_LABELS: Record<AdminOrder["delivery_type"], string> = {
  henting: "Henting",
  levering: "Levering",
};

const POLL_INTERVAL_MS = 30_000;

const timeFormatter = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }
  return timeFormatter.format(date);
}

function formatTotal(total: string) {
  const value = Number(total);
  if (!Number.isFinite(value)) {
    return total;
  }
  return value.toLocaleString("nb-NO", { maximumFractionDigits: 0 });
}

export default function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Kunne ikke hente bestillinger.");
      }
      const data = (await response.json()) as { orders: AdminOrder[] };
      setOrders(data.orders);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunne ikke hente bestillinger.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    const interval = setInterval(() => {
      void fetchOrders();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = useCallback(
    async (orderId: number, status: AdminOrder["status"]) => {
      setUpdatingId(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
      try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          throw new Error("Kunne ikke oppdatere status.");
        }
        await fetchOrders();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Kunne ikke oppdatere status.";
        setError(message);
        await fetchOrders();
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchOrders],
  );

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [orders],
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-4 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-5xl uppercase tracking-[0.1em] text-[var(--color-gold)]">
            Admin - Innkommende ordre
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Oppdateres hvert 30. sekund.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchOrders()}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs uppercase tracking-[0.12em] hover:border-[var(--color-gold)]"
        >
          Oppdater nå
        </button>
      </header>

      {error ? (
        <div className="rounded bg-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      {isLoading && orders.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Laster bestillinger...
        </p>
      ) : null}

      {!isLoading && sortedOrders.length === 0 ? (
        <p className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted)]">
          Ingen bestillinger enda.
        </p>
      ) : null}

      {sortedOrders.map((order) => {
        const orderNumber = String(order.id).padStart(5, "0");
        const isUpdating = updatingId === order.id;
        return (
          <article
            key={order.id}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-2xl uppercase tracking-[0.08em]">
                Ordre #{orderNumber}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                {formatTime(order.created_at)} - {order.location_slug}
              </p>
            </div>
            <p className="text-sm">
              {order.customer_name} - {order.customer_phone} -{" "}
              {DELIVERY_LABELS[order.delivery_type]}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {order.items.length === 0
                ? "Ingen varer"
                : order.items
                    .map((item) => `${item.quantity}x ${item.name}`)
                    .join(", ")}
            </p>
            <p className="mt-2 font-display text-xl uppercase tracking-[0.08em]">
              Totalt kr {formatTotal(order.total)},-
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => {
                const isActive = order.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isUpdating || isActive}
                    onClick={() => void updateStatus(order.id, status)}
                    className={`rounded-md border px-3 py-1 text-xs uppercase tracking-[0.12em] disabled:cursor-not-allowed ${
                      isActive
                        ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-black"
                        : "border-[var(--color-border)] hover:border-[var(--color-gold)]"
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                );
              })}
            </div>
          </article>
        );
      })}
    </main>
  );
}
