import { CheckoutPageClient } from "@/src/components/pages/CheckoutPageClient";

type CheckoutPageProps = {
  params: Promise<{ location: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { location } = await params;
  return <CheckoutPageClient location={location} />;
}
