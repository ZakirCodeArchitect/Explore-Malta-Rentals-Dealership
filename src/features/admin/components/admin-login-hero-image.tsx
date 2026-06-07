import Image from "next/image";

const ADMIN_LOGIN_HERO_SRC = `/TourPage-images/${encodeURIComponent("TOURS PAGE BIKES PHOTO.webp")}`;

type AdminLoginHeroImageProps = Readonly<{
  alt: string;
  brandLabel: string;
}>;

export function AdminLoginHeroImage({ alt, brandLabel }: AdminLoginHeroImageProps) {
  return (
    <div className="relative aspect-[2/1] w-full bg-slate-100">
      <Image
        src={ADMIN_LOGIN_HERO_SRC}
        alt={alt}
        fill
        priority
        sizes="(max-width: 374px) 100vw, 374px"
        className="object-cover object-[center_42%] saturate-[1.05] contrast-[1.02]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#24345b]/45 via-[#24345b]/10 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-[#3a7ca5]/15"
      />

      <p
        aria-hidden
        className="absolute bottom-2.5 right-3.5 text-right text-xs font-semibold leading-snug tracking-wide text-white drop-shadow-[0_2px_8px_rgba(15,34,51,0.55)] sm:bottom-3 sm:right-4 sm:text-sm"
      >
        {brandLabel}
      </p>
    </div>
  );
}
