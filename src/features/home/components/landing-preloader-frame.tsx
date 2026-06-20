import {
  BRAND_TITLE,
  SVG_HEIGHT,
  SVG_WIDTH,
  TEXT_Y,
} from "@/features/home/lib/landing-preloader-shared";
import type { RefObject } from "react";

type LandingPreloaderFrameProps = Readonly<{
  clipId: string;
  wavePath: string;
  percent?: string;
  instant?: boolean;
  animated?: boolean;
  rootRef?: RefObject<HTMLDivElement | null>;
  waveRef?: RefObject<SVGPathElement | null>;
  percentRef?: RefObject<HTMLSpanElement | null>;
}>;

export function LandingPreloaderFrame({
  clipId,
  wavePath,
  percent = "0",
  instant = false,
  animated = false,
  rootRef,
  waveRef,
  percentRef,
}: LandingPreloaderFrameProps) {
  return (
    <div
      ref={rootRef}
      className={[
        "landing-preloader",
        instant ? "landing-preloader--instant" : null,
        animated ? "landing-preloader--animated" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      role={instant ? "presentation" : "status"}
      aria-live={instant ? undefined : "polite"}
      aria-label={instant ? undefined : `Loading ${BRAND_TITLE}`}
      aria-hidden={instant ? true : undefined}
    >
      <div className="landing-preloader__brand">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="landing-preloader__title-svg"
          role="img"
          aria-label={BRAND_TITLE}
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <path ref={waveRef} d={wavePath} />
            </clipPath>
          </defs>

          <text
            x={SVG_WIDTH / 2}
            y={TEXT_Y}
            textAnchor="middle"
            className="landing-preloader__title-base"
          >
            {BRAND_TITLE}
          </text>

          <text
            x={SVG_WIDTH / 2}
            y={TEXT_Y}
            textAnchor="middle"
            className="landing-preloader__title-fill"
            clipPath={`url(#${clipId})`}
          >
            {BRAND_TITLE}
          </text>
        </svg>

        <p className="landing-preloader__loader">
          loading... <span ref={percentRef}>{percent}</span> %
        </p>
      </div>
    </div>
  );
}
