"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useId, useRef } from "react";
import { LandingPreloaderFrame } from "@/features/home/components/landing-preloader-frame";
import {
  buildWavePath,
  INITIAL_WAVE_PATH,
  MAX_DURATION_S,
  MIN_DURATION_S,
  SVG_HEIGHT,
  SVG_WIDTH,
} from "@/features/home/lib/landing-preloader-shared";

type LandingPreloaderProps = Readonly<{
  onReveal: () => void;
  onDismiss: () => void;
}>;

function waitForPageReady(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (document.readyState === "complete") return Promise.resolve();

  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

export function LandingPreloader({ onReveal, onDismiss }: LandingPreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<SVGPathElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const clipId = useId().replace(/:/g, "");

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const wave = waveRef.current;
      const percentNode = percentRef.current;

      if (overlay == null || wave == null || percentNode == null) {
        return;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        onReveal();
        onDismiss();
        return;
      }

      const progress = { value: 0, phase: 0 };

      const updateWave = () => {
        const fillRatio = progress.value / 100;
        wave.setAttribute(
          "d",
          buildWavePath(SVG_WIDTH, SVG_HEIGHT, fillRatio, progress.phase),
        );
        percentNode.textContent = `${Math.round(progress.value)}`;
      };

      wave.setAttribute("d", INITIAL_WAVE_PATH);
      updateWave();

      const phaseTween = gsap.to(progress, {
        phase: Math.PI * 2,
        duration: 2.4,
        repeat: -1,
        ease: "none",
        onUpdate: updateWave,
      });

      const counter = gsap.to(progress, {
        value: 92,
        duration: MIN_DURATION_S,
        ease: "power2.inOut",
        onUpdate: updateWave,
      });

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        phaseTween.kill();
        counter.kill();

        gsap.to(progress, {
          value: 100,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: updateWave,
          onComplete: () => {
            onReveal();
            gsap.to(overlay, {
              autoAlpha: 0,
              duration: 0.75,
              ease: "power2.inOut",
              onComplete: onDismiss,
            });
          },
        });
      };

      const start = performance.now();
      void waitForPageReady().then(() => {
        const elapsed = (performance.now() - start) / 1000;
        const remaining = Math.max(0, MIN_DURATION_S - elapsed);
        gsap.delayedCall(remaining, () => {
          counter.kill();
          finish();
        });
      });

      gsap.delayedCall(MAX_DURATION_S, () => {
        counter.kill();
        finish();
      });

      return () => {
        phaseTween.kill();
        counter.kill();
      };
    },
    { dependencies: [clipId, onDismiss, onReveal] },
  );

  return (
    <LandingPreloaderFrame
      rootRef={overlayRef}
      animated
      clipId={clipId}
      wavePath={INITIAL_WAVE_PATH}
      waveRef={waveRef}
      percentRef={percentRef}
    />
  );
}
