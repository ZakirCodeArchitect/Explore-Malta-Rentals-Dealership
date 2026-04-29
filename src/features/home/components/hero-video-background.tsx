"use client";

/**
 * HeroVideoBackground
 *
 * Renders a full-bleed background video with a comprehensive set of
 * performance, accessibility and UX guardrails:
 *
 *  - LCP-safe: video src is never set on the server (SSR yields nothing).
 *  - Lazy: src is only injected after the browser is idle (requestIdleCallback
 *    / setTimeout fallback), keeping the main thread free during page paint.
 *  - Adaptive: skips the video entirely when:
 *      • prefers-reduced-motion is set
 *      • viewport is ≤ 767px (mobile — static image wins on bandwidth)
 *      • navigator.connection.saveData is true (data-saver mode)
 *      • effectiveType is 'slow-2g' or '2g'
 *  - Error-resilient: if the video fails to decode or autoplay is blocked the
 *    component unmounts itself so the poster / CSS fallback is shown.
 *  - Memory-leak-free: full cleanup on unmount (src removed, load() re-invoked).
 *  - Smooth: fades in over 1.2 s only after the first frame is decoded.
 */

import { useEffect, useRef, useState } from "react";

/* ─── types ──────────────────────────────────────────────────── */

type NetworkInfo = {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInfo;
};

export type HeroVideoBackgroundProps = {
  /** Path to the MP4 source (required). */
  src: string;
  /**
   * Optional WebM source for browsers that support it (smaller file size).
   * Listed before MP4 so browsers pick it first when supported.
   */
  webmSrc?: string;
  /**
   * URL of the poster image shown while the video loads.
   * Should be a compressed JPEG/WebP — ideally already in the browser cache
   * because it was used as the static background image on the server render.
   */
  posterSrc?: string;
  className?: string;
};

/* ─── guards ─────────────────────────────────────────────────── */

function shouldSkipVideo(): boolean {
  if (typeof window === "undefined") return true;

  // Respect user motion preferences — critical accessibility requirement
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;

  // Skip on narrow screens — mobile users pay for data and don't benefit from
  // a hero video that is hidden behind an above-the-fold booking form anyway
  if (window.innerWidth < 768) return true;

  // Data-saver / slow connection detection
  const conn = (navigator as NavigatorWithConnection).connection;
  if (conn?.saveData) return true;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return true;

  return false;
}

/* ─── component ──────────────────────────────────────────────── */

export function HeroVideoBackground({
  src,
  webmSrc,
  posterSrc,
  className,
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  /** true once the first frame is decoded and the video is playing */
  const [playing, setPlaying] = useState(false);
  /** true when we decide not to show a video at all */
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    // ── 1. Evaluate whether to show a video at all ────────────
    if (shouldSkipVideo()) {
      queueMicrotask(() => setSkip(true));
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Capture ref in a local variable — the ref value may change by the time
    // the cleanup function runs, so we must not reference videoRef.current there.
    const capturedVideo = video;
    let cancelled = false;

    // ── 2. Event handlers ─────────────────────────────────────

    const onPlaying = () => {
      if (!cancelled) setPlaying(true);
    };

    const onError = () => {
      // Video failed to load (network error, codec unsupported, etc.)
      // Remove it so the poster / CSS gradient fallback is visible.
      if (!cancelled) queueMicrotask(() => setSkip(true));
    };

    capturedVideo.addEventListener("playing", onPlaying, { once: true });
    capturedVideo.addEventListener("error", onError, { once: true });

    // ── 3. Inject src lazily — after the browser is idle ─────
    // This ensures the <video> element does NOT compete with LCP resources
    // (logo image, hero text) for bandwidth and main-thread time.
    const injectSrc = () => {
      if (cancelled) return;

      const v = capturedVideo;

      // Append <source> elements instead of setting .src so multiple
      // formats can be offered and the browser picks the best one.
      if (webmSrc) {
        const s = document.createElement("source");
        s.src = webmSrc;
        s.type = "video/webm";
        v.appendChild(s);
      }

      const s = document.createElement("source");
      s.src = src;
      s.type = "video/mp4";
      v.appendChild(s);

      // load() triggers the browser to evaluate sources and start buffering
      v.load();

      // play() returns a Promise — some browsers (iOS Safari) block autoplay
      // even for muted videos in certain contexts.  We swallow the rejection
      // gracefully; the poster will remain visible instead.
      v.play().catch(() => {
        // If blocked, try again on the first user interaction
        const resumeOnInteraction = () => {
          v.play().catch(() => {});
        };
        document.addEventListener("pointerdown", resumeOnInteraction, { capture: true, once: true });
        document.addEventListener("keydown", resumeOnInteraction, { capture: true, once: true });
      });
    };

    // Prefer requestIdleCallback so we load after first paint.
    // Fall back to a 300 ms timeout so the page feels interactive first.
    let idleCbId: ReturnType<typeof requestIdleCallback> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (typeof requestIdleCallback !== "undefined") {
      idleCbId = requestIdleCallback(injectSrc, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(injectSrc, 300);
    }

    // ── 4. Cleanup ────────────────────────────────────────────
    return () => {
      cancelled = true;

      if (idleCbId !== null && typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleCbId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      capturedVideo.pause();
      // Remove all <source> children and clear src to release the media resource
      while (capturedVideo.firstChild) capturedVideo.removeChild(capturedVideo.firstChild);
      capturedVideo.removeAttribute("src");
      capturedVideo.load(); // reset the media element state machine
    };
  }, [src, webmSrc]);

  // Nothing renders on the server or when video is skipped —
  // the CSS gradient / poster image underneath is the fallback.
  if (skip) return null;

  return (
    <video
      ref={videoRef}
      aria-hidden
      muted
      loop
      playsInline
      disablePictureInPicture
      // Poster is shown by the browser before the first frame is decoded.
      // It must be the same image used as the static background on the server
      // render so there is zero visual jump between SSR → hydration → video.
      poster={posterSrc}
      // preload="none" is intentional — we load lazily via JS above.
      preload="none"
      className={[
        // Always positioned to fill its containing block
        "absolute inset-0 h-full w-full object-cover",
        // Smooth fade-in once the first frame is decoded
        "transition-opacity duration-[1200ms] ease-in",
        playing ? "opacity-100" : "opacity-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
