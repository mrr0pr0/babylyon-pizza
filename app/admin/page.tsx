const incomingOrders = [
  {
    id: 1204,
    customer: "Ola Nordmann",
    phone: "99 11 22 33",
    deliveryType: "Henting",
    total: 428,
    items: ["1x Rull Kebab", "1x Babylon Spesial"],
    createdAt: "10:32",
  },
  {
    id: 1203,
    customer: "Kari Nordmann",
    phone: "95 44 22 31",
    deliveryType: "Levering",
    total: 214,
    items: ["1x Babylon Spesial"],
    createdAt: "10:27",
  },
];

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-4 px-4 py-6">
      <h1 className="font-display text-5xl uppercase tracking-[0.1em] text-[var(--color-gold)]">
        Admin - Innkommende ordre
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        Oppdateres hvert 30. sekund.
      </p>
      {incomingOrders.map((order) => (
        <article
          key={order.id}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-2xl uppercase tracking-[0.08em]">
              Ordre #{order.id}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {order.createdAt}
            </p>
          </div>
          <p className="text-sm">
            {order.customer} - {order.phone} - {order.deliveryType}
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            {order.items.join(", ")}
          </p>
          <p className="mt-2 font-display text-xl uppercase tracking-[0.08em]">
            Totalt kr {order.total},-
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Mottatt", "Forberedes", "Klar", "Levert"].map((status) => (
              <button
                key={status}
                type="button"
                className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs uppercase tracking-[0.12em] hover:border-[var(--color-gold)]"
              >
                {status}
              </button>
            ))}
          </div>
        </article>
      ))}
    </main>
  );
}
