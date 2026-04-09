"use client";

import { useState } from "react";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";

import { BrandBlueUnderlinedText } from "@/features/guide/components/brand-blue-underlined-text";
import { GuideParkingRulesSlider } from "@/features/guide/components/guide-parking-rules-slider";

/** Radial wash from bottom-left; taller ellipse so the glow reaches further up the left edge */
const LINE_COLOR_CORNER_SHADE: Record<"blue" | "green", string> = {
  blue:
    "radial-gradient(ellipse 130% 125% at 0% 100%, rgba(125, 211, 252, 0.44) 0%, rgba(224, 242, 254, 0.14) 48%, rgba(248, 250, 252, 0) 78%)",
  green:
    "radial-gradient(ellipse 130% 125% at 0% 100%, rgba(110, 231, 183, 0.42) 0%, rgba(209, 250, 229, 0.12) 48%, rgba(248, 250, 252, 0) 78%)",
};

const NEUTRAL_CORNER_SHADE =
  "radial-gradient(ellipse 125% 118% at 0% 100%, rgba(226, 232, 240, 0.32) 0%, rgba(241, 245, 249, 0.08) 50%, rgba(248, 250, 252, 0) 76%)";

export function GuideParkingRulesSection() {
  const [activeLineTint, setActiveLineTint] = useState<"blue" | "green" | null>("blue");

  const shade =
    activeLineTint === null ? NEUTRAL_CORNER_SHADE : LINE_COLOR_CORNER_SHADE[activeLineTint];

  return (
    <section
      id="guide-parking-rules"
      aria-labelledby="guide-parking-rules-title"
      className="relative isolate scroll-mt-28 overflow-hidden border-t border-slate-200/70 bg-[#f8fafc] py-14 sm:py-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[length:100%_100%] transition-[background-image] duration-700 ease-out"
        style={{ backgroundImage: shade }}
      />
      <Container className="relative z-10">
        <SectionHeader
          titleId="guide-parking-rules-title"
          title={
            <>
              Guide for <BrandBlueUnderlinedText>Parking Rules</BrandBlueUnderlinedText> for Scooters in Malta
            </>
          }
          tone="light"
          description="Quick parking essentials to avoid fines and keep scooters parked legally."
        />

        <GuideParkingRulesSlider onActiveLineColorChange={setActiveLineTint} />
      </Container>
    </section>
  );
}
