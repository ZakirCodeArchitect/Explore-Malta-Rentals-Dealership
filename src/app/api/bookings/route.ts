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

function assertSingleFilePerField(formData: FormData, key: string): void {
  const values = formData.getAll(key).filter((entry) => entry instanceof File && entry.size > 0);
  if (values.length > 1) {
    throw new Error(`Multiple files provided for ${key}`);
  }
}

async function parseMultipartPayload(request: Request): Promise<MultipartBookingRequest> {
  const formData = await request.formData();
  assertSingleFilePerField(formData, "customer_license");
  assertSingleFilePerField(formData, "customer_passport");
  assertSingleFilePerField(formData, "additional_driver_passport");
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
    const bookingTempRef =
      typeof submissionPayload.holdReference === "string" ? submissionPayload.holdReference : undefined;

    if (multipartFiles?.customerLicenseFile) {
      const uploaded = await uploadFile(multipartFiles.customerLicenseFile, {
        category: "customer_license",
        bookingTempRef,
        folderHint: "documents",
      });
      submissionPayload.customer.licenseUploadPath = uploaded.relativePath;
    }
    if (multipartFiles?.customerPassportFile) {
      const uploaded = await uploadFile(multipartFiles.customerPassportFile, {
        category: "customer_passport",
        bookingTempRef,
        folderHint: "documents",
      });
      submissionPayload.customer.passportUploadPath = uploaded.relativePath;
    }
    if (multipartFiles?.additionalDriverPassportFile) {
      const uploaded = await uploadFile(multipartFiles.additionalDriverPassportFile, {
        category: "additional_driver_passport",
        bookingTempRef,
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
