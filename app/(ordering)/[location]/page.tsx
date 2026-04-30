import { LocationMenuPageClient } from "@/src/components/pages/LocationMenuPageClient";

type MenuPageProps = {
  params: Promise<{ location: string }>;
};

export default async function LocationMenuPage({ params }: MenuPageProps) {
  const { location } = await params;
  return <LocationMenuPageClient location={location} />;
}
