import type { HotelSettlementStatus } from "@/generated/prisma/index";

export type AdminHotelPaymentStatus = HotelSettlementStatus;

export type AdminHotelPaymentListFilters = {
  hotelPartnerId?: string;
  month?: number;
  year?: number;
  status?: AdminHotelPaymentStatus;
};

export type AdminHotelPaymentListItem = {
  id: string;
  hotelPartnerId: string;
  hotelName: string;
  hotelIsActive: boolean;
  month: number;
  year: number;
  bookingCountSnapshot: number;
  totalBookingAmountSnapshot: number;
  totalHotelDiscountSnapshot: number;
  settlementAmountDue: number;
  amountPaid: number;
  status: AdminHotelPaymentStatus;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminHotelPaymentDetail = AdminHotelPaymentListItem;

export type AdminHotelPaymentListResult = {
  total: number;
  settlements: AdminHotelPaymentListItem[];
};

export type AdminHotelSettlementPreview = {
  hotelPartnerId: string;
  month: number;
  year: number;
  bookingCount: number;
  totalBookingAmount: number;
  totalHotelDiscount: number;
};
