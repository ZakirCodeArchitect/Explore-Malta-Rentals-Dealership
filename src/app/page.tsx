import { VideoHero } from "@/features/home/components/video-hero";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <VideoHero />
      <div id="booking-preview" className="sr-only" />
      <div id="fleet-preview" className="sr-only" />
    </main>
  );
}
