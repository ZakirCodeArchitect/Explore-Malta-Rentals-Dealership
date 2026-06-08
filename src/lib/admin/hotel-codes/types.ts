export type AdminHotelCodeListItem = Readonly<{
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  hotelPartnerId: string;
  hotelPartnerName: string;
  hotelPartnerIsActive: boolean;
  bookingCount: number;
  totalBookingValue: number;
  canDelete: boolean;
}>;

export type AdminHotelCodeDetail = Readonly<{
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  hotelPartnerId: string;
  hotelPartnerName: string;
  hotelPartnerIsActive: boolean;
  bookingCount: number;
  totalBookingValue: number;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type AdminHotelCodeListFilters = Readonly<{
  search?: string;
  code?: string;
  hotelPartnerId?: string;
  isActive?: boolean;
}>;

export type AdminHotelCodeListResult = Readonly<{
  total: number;
  codes: AdminHotelCodeListItem[];
}>;
