import { CartSidebar } from "@/src/components/cart/CartSidebar";

type ConfirmationPageProps = {
  params: Promise<{ location: string }>;
};

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { location } = await params;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <div className="mb-4 text-7xl text-[var(--color-gold)]">✓</div>
        <h1 className="font-display text-5xl uppercase tracking-[0.12em]">Din ordre er mottatt!</h1>
        <p className="mt-2 text-[var(--color-muted)]">Ordrenummer: #10241</p>
        <p className="text-[var(--color-muted)]">Estimert tid: 25-35 minutter</p>
      </section>
      <CartSidebar location={location} step={3} />
    </div>
  );
}
