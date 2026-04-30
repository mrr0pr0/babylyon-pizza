import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-display text-6xl uppercase tracking-[0.12em] text-[var(--color-gold)]">
        Babylon Pizza
      </h1>
      <p className="max-w-lg text-[var(--color-muted)]">
        Dette prosjektet inneholder kun bestillingssystemet. Velg avdeling for a starte bestilling.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/as" className="rounded-md bg-[var(--color-gold)] px-6 py-3 text-black">
          Bestill As
        </Link>
        <Link href="/vestby" className="rounded-md bg-[var(--color-gold)] px-6 py-3 text-black">
          Bestill Vestby
        </Link>
        <Link href="/drobak" className="rounded-md bg-[var(--color-gold)] px-6 py-3 text-black">
          Bestill Drobak
        </Link>
      </div>
    </main>
  );
}
