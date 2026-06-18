export { bookingSubmissionSchema } from "@/lib/booking/bookingSubmissionSchema";
export { normalizeBookingPayload } from "@/lib/booking/normalizeBookingPayload";
export {
  submitBooking,
  SubmitBookingValidationError,
  AvailabilityConflictError,
} from "@/lib/booking/submitBooking";
export { validateBookingPayload } from "@/lib/booking/validateBookingPayload";
export { validateStorageBoxSelection } from "@/lib/booking/validateStorageBoxSelection";
export type {
  BookingSubmission,
  BookingSubmissionInput,
  BookingValidationResult,
  NormalizedBookingPayload,
  ValidationError,
} from "@/lib/booking/types";
