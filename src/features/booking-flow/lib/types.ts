export type BookingFlowState = {
  vehicle: {
    selectedVehicleId: string;
    selectedVehicleSlug: string;
    selectedVehicleName: string;
    selectedVehicleType: string;
  };
  rentalDates: {
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
  };
  pricing: {
    acknowledged: boolean;
  };
  pickupDropoff: {
    pickupType: "office" | "delivery";
    dropoffType: "office" | "delivery";
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
    dob: string;
    licenseCategory: "" | "B" | "AM" | "A" | "A1" | "A2";
    licenseUploadName: string;
    idUploadName: string;
    officeLicenseConfirmed: boolean;
    officeIdConfirmed: boolean;
    specialNotes: string;
  };
  additionalDriver: {
    fullName: string;
    phone: string;
    email: string;
    nationality: string;
    dob: string;
    licenseCategory: "" | "B" | "AM" | "A" | "A1" | "A2";
    passportIdUploadName: string;
    officeIdConfirmed: boolean;
  };
  securityDeposit: {
    method: "online" | "in_person" | "";
  };
  summary: {
    reviewed: boolean;
  };
  terms: {
    accepted: boolean;
    acceptedAtIso: string;
  };
};

export const INITIAL_BOOKING_FLOW_STATE: BookingFlowState = {
  vehicle: {
    selectedVehicleId: "",
    selectedVehicleSlug: "",
    selectedVehicleName: "",
    selectedVehicleType: "",
  },
  rentalDates: {
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    returnTime: "",
  },
  pricing: {
    acknowledged: false,
  },
  pickupDropoff: {
    pickupType: "office",
    dropoffType: "office",
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
    dob: "",
    licenseCategory: "",
    licenseUploadName: "",
    idUploadName: "",
    officeLicenseConfirmed: false,
    officeIdConfirmed: false,
    specialNotes: "",
  },
  additionalDriver: {
    fullName: "",
    phone: "",
    email: "",
    nationality: "",
    dob: "",
    licenseCategory: "",
    passportIdUploadName: "",
    officeIdConfirmed: false,
  },
  securityDeposit: {
    method: "",
  },
  summary: {
    reviewed: false,
  },
  terms: {
    accepted: false,
    acceptedAtIso: "",
  },
};
