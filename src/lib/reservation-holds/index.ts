import { randomBytes } from "node:crypto";
import { format } from "date-fns";
import { z } from "zod";

import { Prisma, VehicleType, type ReservationHoldStatus } from "@/generated/prisma/index";
import { checkVehicleAvailability } from "@/lib/availability";
import { combineDateAndTime } from "@/lib/booking/bookingSubmissionSchema";
import { prisma } from "@/lib/prisma";

export const HOLD_DURATION_MS = 15 * 60 * 1000;
const HOLD_REFERENCE_PREFIX = "HLD";
const HOLD_REFERENCE_RETRY_LIMIT = 5;

type ValidationError = {
  path: string;
  message: string;
};

type ReservationHoldRecord = {
  id: string;
  holdReference: string;
  vehicleId: string;
  vehicleType: VehicleType;
  sessionKey: string;
  customerEmail: string | null;
  customerName: string | null;
  pickupDateTime: Date;
  returnDateTime: Date;
  status: ReservationHoldStatus;
  reservedAt: Date;
  expiresAt: Date;
  lastHeartbeatAt: Date | null;
  bookingId: string | null;
};

const createReservationHoldSchema = z
  .object({
    vehicleId: z.string().trim().min(1, "vehicleId is required"),
    vehicleType: z.nativeEnum(VehicleType),
    pickupDate: z.string().trim().min(1, "pickupDate is required"),
    pickupTime: z.string().trim().min(1, "pickupTime is required"),
    returnDate: z.string().trim().min(1, "returnDate is required"),
    returnTime: z.string().trim().min(1, "returnTime is required"),
    sessionKey: z.string().trim().min(1).max(120).optional(),
    customerEmail: z.string().trim().email().optional(),
    customerName: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

type CreateReservationHoldInput = z.infer<typeof createReservationHoldSchema> & {
  pickupDateTime: Date;
  returnDateTime: Date;
};

function formatIssuePath(path: (string | number)[]): string {
  return path.map((segment) => String(segment)).join(".");
}

export class ReservationHoldValidationError extends Error {
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super("Reservation hold payload validation failed");
    this.name = "ReservationHoldValidationError";
    this.errors = errors;
  }
}

export class ReservationHoldConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationHoldConflictError";
  }
}

export class ReservationHoldStateError extends Error {
  readonly holdStatus: ReservationHoldStatus;

  constructor(message: string, holdStatus: ReservationHoldStatus) {
    super(message);
    this.name = "ReservationHoldStateError";
    this.holdStatus = holdStatus;
  }
}

export function generateSessionKey(): string {
  return randomBytes(16).toString("hex");
}

function generateHoldReference(now = new Date()): string {
  return `${HOLD_REFERENCE_PREFIX}-${format(now, "yyyyMMdd")}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function getExpiryFrom(now = new Date()): Date {
  return new Date(now.getTime() + HOLD_DURATION_MS);
}

export function isHoldExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

function normalizeCreateInput(payload: unknown): CreateReservationHoldInput {
  const parsed = createReservationHoldSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ReservationHoldValidationError(
      parsed.error.issues.map((issue) => ({
        path: formatIssuePath(issue.path),
        message: issue.message,
      })),
    );
  }

  const pickupDateTime = combineDateAndTime(parsed.data.pickupDate, parsed.data.pickupTime);
  const returnDateTime = combineDateAndTime(parsed.data.returnDate, parsed.data.returnTime);
  if (!pickupDateTime || !returnDateTime || pickupDateTime >= returnDateTime) {
    throw new ReservationHoldValidationError([
      {
        path: "pickupDate",
        message: "Invalid pickup/return date range",
      },
    ]);
  }

  return {
    ...parsed.data,
    pickupDateTime,
    returnDateTime,
  };
}

function toReservationHoldResponse(hold: ReservationHoldRecord, now = new Date()) {
  const status = hold.status === "ACTIVE" && isHoldExpired(hold.expiresAt, now) ? "EXPIRED" : hold.status;
  const remainingMs = Math.max(0, hold.expiresAt.getTime() - now.getTime());

  return {
    holdReference: hold.holdReference,
    sessionKey: hold.sessionKey,
    status,
    expiresAt: hold.expiresAt,
    reservedAt: hold.reservedAt,
    lastHeartbeatAt: hold.lastHeartbeatAt,
    pickupDateTime: hold.pickupDateTime,
    returnDateTime: hold.returnDateTime,
    vehicleId: hold.vehicleId,
    vehicleType: hold.vehicleType,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  };
}

async function expireHoldWhenStale(holdId: string, db: Prisma.TransactionClient | typeof prisma): Promise<void> {
  await db.reservationHold.updateMany({
    where: {
      id: holdId,
      status: "ACTIVE",
      expiresAt: { lte: new Date() },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

const holdSelect = {
  id: true,
  holdReference: true,
  vehicleId: true,
  vehicleType: true,
  sessionKey: true,
  customerEmail: true,
  customerName: true,
  pickupDateTime: true,
  returnDateTime: true,
  status: true,
  reservedAt: true,
  expiresAt: true,
  lastHeartbeatAt: true,
  bookingId: true,
} satisfies Prisma.ReservationHoldSelect;

async function createHoldWithUniqueReference(
  input: CreateReservationHoldInput,
  sessionKey: string,
  db: Prisma.TransactionClient,
): Promise<ReservationHoldRecord> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < HOLD_REFERENCE_RETRY_LIMIT; attempt += 1) {
    const holdReference = generateHoldReference();
    try {
      return await db.reservationHold.create({
        data: {
          holdReference,
          vehicleId: input.vehicleId,
          vehicleType: input.vehicleType,
          sessionKey,
          customerEmail: input.customerEmail ?? null,
          customerName: input.customerName ?? null,
          pickupDateTime: input.pickupDateTime,
          returnDateTime: input.returnDateTime,
          status: "ACTIVE",
          reservedAt: new Date(),
          expiresAt: getExpiryFrom(),
        },
        select: holdSelect,
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError ?? new Error("Failed to generate hold reference");
}

export async function createReservationHold(payload: unknown) {
  const input = normalizeCreateInput(payload);
  const sessionKey = input.sessionKey ?? generateSessionKey();

  const hold = await prisma.$transaction(
    async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: input.vehicleId },
        select: { id: true, vehicleType: true, isActive: true },
      });
      if (!vehicle) {
        throw new ReservationHoldValidationError([{ path: "vehicleId", message: "Vehicle not found" }]);
      }
      if (!vehicle.isActive) {
        throw new ReservationHoldValidationError([
          { path: "vehicleId", message: "Selected vehicle is not active" },
        ]);
      }
      if (vehicle.vehicleType !== input.vehicleType) {
        throw new ReservationHoldValidationError([
          { path: "vehicleType", message: "Vehicle type does not match selected vehicle" },
        ]);
      }

      const reusableHold = await tx.reservationHold.findFirst({
        where: {
          sessionKey,
          vehicleId: input.vehicleId,
          pickupDateTime: input.pickupDateTime,
          returnDateTime: input.returnDateTime,
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: holdSelect,
      });
      if (reusableHold) {
        return tx.reservationHold.update({
          where: { id: reusableHold.id },
          data: {
            expiresAt: getExpiryFrom(),
            lastHeartbeatAt: new Date(),
            customerEmail: input.customerEmail ?? reusableHold.customerEmail,
            customerName: input.customerName ?? reusableHold.customerName,
          },
          select: holdSelect,
        });
      }

      const availability = await checkVehicleAvailability(
        {
          vehicleId: input.vehicleId,
          vehicleType: input.vehicleType,
          requestedStart: input.pickupDateTime,
          requestedEnd: input.returnDateTime,
          excludeSessionKey: sessionKey,
        },
        tx,
      );
      if (!availability.isAvailable) {
        throw new ReservationHoldConflictError(
          availability.reason ?? "Selected vehicle is not available for the chosen dates",
        );
      }

      return createHoldWithUniqueReference(input, sessionKey, tx);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  return toReservationHoldResponse(hold);
}

export async function getReservationHoldByReference(holdReference: string) {
  const hold = await prisma.reservationHold.findUnique({
    where: { holdReference },
    select: holdSelect,
  });
  if (!hold) {
    return null;
  }

  if (hold.status === "ACTIVE" && isHoldExpired(hold.expiresAt)) {
    await expireHoldWhenStale(hold.id, prisma);
    return {
      ...hold,
      status: "EXPIRED" as const,
    };
  }

  return hold;
}

export async function heartbeatReservationHold(holdReference: string) {
  const hold = await getReservationHoldByReference(holdReference);
  if (!hold) {
    throw new ReservationHoldStateError("Reservation hold was not found", "EXPIRED");
  }
  if (hold.status !== "ACTIVE") {
    throw new ReservationHoldStateError("Reservation hold is no longer active", hold.status);
  }

  const updated = await prisma.reservationHold.update({
    where: { id: hold.id },
    data: { lastHeartbeatAt: new Date() },
    select: holdSelect,
  });

  return toReservationHoldResponse(updated);
}

export async function releaseReservationHold(holdReference: string) {
  const hold = await getReservationHoldByReference(holdReference);
  if (!hold) {
    return { released: false, hold: null };
  }

  if (hold.status !== "ACTIVE") {
    return { released: false, hold: toReservationHoldResponse(hold) };
  }

  const updated = await prisma.reservationHold.update({
    where: { id: hold.id },
    data: { status: "RELEASED" },
    select: holdSelect,
  });

  return {
    released: true,
    hold: toReservationHoldResponse(updated),
  };
}

export function toReservationHoldStatusResponse(hold: ReservationHoldRecord) {
  return toReservationHoldResponse(hold);
}
