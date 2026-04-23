export type LicenseCategory = "" | "B" | "AM" | "A" | "A1" | "A2";

export type BookingFlowState = {
  rental: {
    vehicleId: string | null;
    vehicleSlug: string;
    vehicleName: string;
    vehicleType: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    pricingAcknowledged: boolean;
  };
  delivery: {
    pickupOption: "office" | "delivery";
    dropoffOption: "office" | "dropoff";
    pickupAddress: string;
    dropoffAddress: string;
  };
  addons: {
    helmet: boolean;
    helmetSize1: string;
    helmetSize2: string;
    additionalDriver: boolean;
    storageBox: boolean;
    cdw: boolean;
    cdwPlan: "none" | "scooter_50" | "scooter_125" | "scooter_full" | "atv_full";
  };
  customer: {
    fullName: string;
    phone: string;
    email: string;
    nationality: string;
    dateOfBirth: string;
    licenseCategory: LicenseCategory;
    driverLicenseUpload: string;
    passportUpload: string;
    licenseConfirmationCheckbox: boolean;
    idConfirmationCheckbox: boolean;
    specialNotes: string;
  };
  additionalDriver: {
    fullName: string;
    phone: string;
    email: string;
    nationality: string;
    dateOfBirth: string;
    licenseCategory: LicenseCategory;
    passportIdUpload: string;
    officeIdConfirmed: boolean;
  };
  deposit: {
    depositMethod: "online" | "in_person" | "";
  };
  consent: {
    summaryReviewed: boolean;
    termsAccepted: boolean;
    termsAcceptedAt: string;
  };
};

export const INITIAL_BOOKING_FLOW_STATE: BookingFlowState = {
  rental: {
    vehicleId: null,
    vehicleSlug: "",
    vehicleName: "",
    vehicleType: "",
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    returnTime: "",
    pricingAcknowledged: false,
  },
  delivery: {
    pickupOption: "office",
    dropoffOption: "office",
    pickupAddress: "",
    dropoffAddress: "",
  },
  addons: {
    helmet: false,
    helmetSize1: "",
    helmetSize2: "",
    additionalDriver: false,
    storageBox: false,
    cdw: false,
    cdwPlan: "none",
  },
  customer: {
    fullName: "",
    phone: "",
    email: "",
    nationality: "",
    dateOfBirth: "",
    licenseCategory: "",
    driverLicenseUpload: "",
    passportUpload: "",
    licenseConfirmationCheckbox: false,
    idConfirmationCheckbox: false,
    specialNotes: "",
  },
  additionalDriver: {
    fullName: "",
    phone: "",
    email: "",
    nationality: "",
    dateOfBirth: "",
    licenseCategory: "",
    passportIdUpload: "",
    officeIdConfirmed: false,
  },
  deposit: {
    depositMethod: "",
  },
  consent: {
    summaryReviewed: false,
    termsAccepted: false,
    termsAcceptedAt: "",
  },
};
