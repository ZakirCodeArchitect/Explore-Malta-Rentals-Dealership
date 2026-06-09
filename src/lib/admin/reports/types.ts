import type { BookingStatus } from "@/generated/prisma/index";

export type AdminReportFilters = {
  month?: number;
  year?: number;
  status?: BookingStatus;
  hotelPartnerId?: string;
};

export type AdminReportBookingSummary = {
  totalBookings: number;
  confirmedBookings: number;
  handedOverBookings: number;
  returnedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  totalBookingValue: number;
  totalHotelDiscount: number;
};

export type AdminReportVehicleTypeBreakdown = {
  vehicleType: string;
  count: number;
};

export type AdminReportVehicleStatusBreakdown = {
  catalogStatus: string;
  count: number;
};

export type AdminReportVehicleSummary = {
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  bookedVehicles: number;
  underProcessVehicles: number;
  soldVehicles: number;
  maintenanceVehicles: number;
  inactiveCatalogVehicles: number;
  byType: AdminReportVehicleTypeBreakdown[];
  byCatalogStatus: AdminReportVehicleStatusBreakdown[];
};

export type AdminReportTopHotel = {
  hotelPartnerId: string;
  hotelName: string;
  bookingCount: number;
};

export type AdminReportTopHotelCode = {
  hotelCodeId: string;
  code: string;
  hotelName: string;
  bookingCount: number;
};

export type AdminReportHotelCodeSummary = {
  totalHotels: number;
  activeHotels: number;
  totalHotelCodes: number;
  activeHotelCodes: number;
  bookingsViaHotelCodes: number;
  totalHotelDiscountAmount: number;
  topHotelsByBookings: AdminReportTopHotel[];
  topHotelCodesByBookings: AdminReportTopHotelCode[];
};

export type AdminReportMonthlySettlement = {
  id: string;
  hotelName: string;
  month: number;
  year: number;
  settlementAmountDue: number;
  amountPaid: number;
  outstanding: number;
  status: "DUE" | "PAID" | "PARTIALLY_PAID";
  bookingCountSnapshot: number;
};

export type AdminReportHotelPaymentSummary = {
  totalSettlementAmountDue: number;
  totalAmountPaid: number;
  totalOutstanding: number;
  dueCount: number;
  paidCount: number;
  partiallyPaidCount: number;
  monthlySettlements: AdminReportMonthlySettlement[];
};

export type AdminReportRecentBooking = {
  id: string;
  bookingReference: string;
  customerFullName: string;
  vehicleName: string;
  createdAt: string;
  status: BookingStatus;
  subtotal: number;
  hotelCode: string | null;
};

export type AdminReportsSummary = {
  filters: AdminReportFilters;
  bookingSummary: AdminReportBookingSummary;
  vehicleSummary: AdminReportVehicleSummary;
  hotelCodeSummary: AdminReportHotelCodeSummary;
  hotelPaymentSummary: AdminReportHotelPaymentSummary;
  recentBookings: AdminReportRecentBooking[];
};
