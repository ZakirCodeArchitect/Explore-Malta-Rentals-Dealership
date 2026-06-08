import { normalizeHotelCode } from "@/lib/hotel-codes/normalize-hotel-code";
import { prisma } from "@/lib/prisma";

export type ValidatedHotelCode = Readonly<{
  hotelCodeId: string;
  hotelPartnerId: string;
  code: string;
  discountPercent: number;
  partnerName: string;
}>;

export type HotelCodeValidationResult =
  | { valid: true; data: ValidatedHotelCode }
  | { valid: false; reason: string };

function isWithinValidityWindow(
  validFrom: Date | null,
  validUntil: Date | null,
  asOf: Date,
): boolean {
  if (validFrom && asOf < validFrom) {
    return false;
  }
  if (validUntil && asOf > validUntil) {
    return false;
  }
  return true;
}

export async function validateHotelCode(
  rawCode: string | null | undefined,
  asOf: Date = new Date(),
): Promise<HotelCodeValidationResult> {
  const normalized = normalizeHotelCode(rawCode ?? "");
  if (!normalized) {
    return { valid: false, reason: "Enter a hotel or partner code" };
  }

  const record = await prisma.hotelCode.findUnique({
    where: { code: normalized },
    select: {
      id: true,
      code: true,
      discountPercent: true,
      isActive: true,
      validFrom: true,
      validUntil: true,
      hotelPartner: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  if (!record) {
    return { valid: false, reason: "This hotel or partner code is not recognized" };
  }

  if (!record.isActive) {
    return { valid: false, reason: "This hotel or partner code is no longer active" };
  }

  if (!record.hotelPartner.isActive) {
    return { valid: false, reason: "This hotel or partner is no longer active" };
  }

  if (!isWithinValidityWindow(record.validFrom, record.validUntil, asOf)) {
    return { valid: false, reason: "This hotel or partner code is not valid for the current date" };
  }

  return {
    valid: true,
    data: {
      hotelCodeId: record.id,
      hotelPartnerId: record.hotelPartner.id,
      code: record.code,
      discountPercent: record.discountPercent.toNumber(),
      partnerName: record.hotelPartner.name,
    },
  };
}
