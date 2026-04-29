import { NextResponse } from "next/server";
import {
  AvailabilityConflictError,
  submitBooking,
  SubmitBookingValidationError,
  type BookingSubmissionInput,
} from "@/lib/booking";
import { uploadFile } from "@/lib/uploads/uploadService";

type MultipartBookingRequest = {
  payload: BookingSubmissionInput;
  customerLicenseFile: File | null;
  customerPassportFile: File | null;
  additionalDriverPassportFile: File | null;
};

function getUploadedFile(formData: FormData, key: string): File | null {
  const candidate = formData.get(key);
  return candidate instanceof File && candidate.size > 0 ? candidate : null;
}

async function parseMultipartPayload(request: Request): Promise<MultipartBookingRequest> {
  const formData = await request.formData();
  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string") {
    throw new Error("Invalid multipart payload");
  }

  const payload = JSON.parse(payloadRaw) as BookingSubmissionInput;
  return {
    payload,
    customerLicenseFile: getUploadedFile(formData, "customer_license"),
    customerPassportFile: getUploadedFile(formData, "customer_passport"),
    additionalDriverPassportFile: getUploadedFile(formData, "additional_driver_passport"),
  };
}

export async function POST(request: Request) {
  let payload: unknown;
  const contentType = request.headers.get("content-type") ?? "";
  let multipartFiles: Omit<MultipartBookingRequest, "payload"> | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const multipart = await parseMultipartPayload(request);
      payload = multipart.payload;
      multipartFiles = {
        customerLicenseFile: multipart.customerLicenseFile,
        customerPassportFile: multipart.customerPassportFile,
        additionalDriverPassportFile: multipart.additionalDriverPassportFile,
      };
    } else {
      payload = await request.json();
    }
  } catch (error) {
    if (contentType.includes("multipart/form-data")) {
      console.error("[bookings] Failed to parse multipart booking payload", error);
    }
    return NextResponse.json(
      {
        success: false as const,
        errors: [{ path: "$", message: "Invalid booking payload" }],
      },
      { status: 400 },
    );
  }

  try {
    const submissionPayload = payload as BookingSubmissionInput;

    if (multipartFiles?.customerLicenseFile) {
      const uploaded = await uploadFile(multipartFiles.customerLicenseFile, {
        category: "customer_license",
        bookingTempRef: submissionPayload.holdReference,
        folderHint: "documents",
      });
      submissionPayload.customer.licenseUploadPath = uploaded.relativePath;
    }
    if (multipartFiles?.customerPassportFile) {
      const uploaded = await uploadFile(multipartFiles.customerPassportFile, {
        category: "customer_passport",
        bookingTempRef: submissionPayload.holdReference,
        folderHint: "documents",
      });
      submissionPayload.customer.passportUploadPath = uploaded.relativePath;
    }
    if (multipartFiles?.additionalDriverPassportFile) {
      const uploaded = await uploadFile(multipartFiles.additionalDriverPassportFile, {
        category: "additional_driver_passport",
        bookingTempRef: submissionPayload.holdReference,
        folderHint: "documents",
      });
      submissionPayload.additionalDriver.passportUploadPath = uploaded.relativePath;
    }

    const result = await submitBooking(submissionPayload);

    return NextResponse.json({
      success: true as const,
      bookingReference: result.bookingReference,
      message: "Booking submitted successfully",
    });
  } catch (error) {
    if (error instanceof SubmitBookingValidationError) {
      return NextResponse.json(
        {
          success: false as const,
          errors: error.errors,
        },
        { status: 400 },
      );
    }
    if (error instanceof AvailabilityConflictError) {
      return NextResponse.json(
        {
          success: false as const,
          message: error.message,
        },
        { status: 409 },
      );
    }
    console.error("[bookings] Failed to submit booking", error);
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to submit booking right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
