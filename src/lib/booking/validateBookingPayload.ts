import { bookingSubmissionSchema } from "@/lib/booking/bookingSubmissionSchema";
import { normalizeBookingPayload } from "@/lib/booking/normalizeBookingPayload";
import type { BookingSubmissionInput, BookingValidationResult } from "@/lib/booking/types";

function formatIssuePath(path: (string | number)[]): string {
  return path.map((segment) => String(segment)).join(".");
}

export function validateBookingPayload(payload: BookingSubmissionInput): BookingValidationResult {
  const parsed = bookingSubmissionSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        path: formatIssuePath(issue.path),
        message: issue.message,
      })),
    };
  }

  return {
    success: true,
    data: normalizeBookingPayload(parsed.data),
  };
}
