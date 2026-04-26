import type { Metadata } from "next";
import { VehicleDetailsShell } from "@/features/vehicles/components/vehicle-details-shell";

type VehicleDetailsPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export async function generateMetadata({ params }: VehicleDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Vehicle Details | Malta Rentals`,
    description: `Browse details for ${slug} and continue booking with live vehicle data.`,
  };
}

export default async function VehicleDetailsPage({ params }: VehicleDetailsPageProps) {
  const { slug } = await params;

  return (
    <main className="flex flex-1 flex-col bg-[var(--background)]">
      <VehicleDetailsShell slug={slug} />
    </main>
  );
}
