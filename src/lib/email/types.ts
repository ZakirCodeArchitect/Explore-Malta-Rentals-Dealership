export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type BookingConfirmationEmailContent = {
  subject: string;
  html: string;
  text: string;
};

export type SendEmailSuccess = {
  ok: true;
  deliveryMode: "gmail" | "development_console";
};

export type SendEmailFailureReason = "transport_create_failed" | "send_failed";

export type SendEmailFailure = {
  ok: false;
  reason: SendEmailFailureReason;
  cause?: unknown;
};

export type SendEmailResult = SendEmailSuccess | SendEmailFailure;

export type SendBookingConfirmationFailureReason =
  | "template_build_failed"
  | SendEmailFailureReason;

export type SendBookingConfirmationResult =
  | { success: true; deliveryMode: "gmail" | "development_console" }
  | { success: false; reason: SendBookingConfirmationFailureReason; cause?: unknown };
