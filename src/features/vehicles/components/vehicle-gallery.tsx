import Image from "next/image";

type VehicleGalleryProps = Readonly<{
  name: string;
  images: readonly string[];
}>;

export function VehicleGallery({ name, images }: VehicleGalleryProps) {
  const [hero, second, third] = images;

  return (
    <section aria-label={`${name} gallery`} className="grid gap-3 sm:grid-cols-2">
      <div className="relative min-h-[18rem] overflow-hidden rounded-2xl sm:row-span-2 sm:min-h-[26rem]">
        <Image src={hero} alt={`${name} main image`} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" />
      </div>
      <div className="relative min-h-[12rem] overflow-hidden rounded-2xl">
        <Image
          src={second ?? hero}
          alt={`${name} side image`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="relative min-h-[12rem] overflow-hidden rounded-2xl">
        <Image
          src={third ?? second ?? hero}
          alt={`${name} detail image`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          loading="lazy"
        />
      </div>
    </section>
  );
}
