export type AdminHotelPartnerListItem = Readonly<{
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  hotelCodeCount: number;
  bookingCount: number;
  canDelete: boolean;
}>;

export type AdminHotelPartnerDetail = Readonly<{
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  hotelCodeCount: number;
  bookingCount: number;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type AdminHotelPartnerListFilters = Readonly<{
  search?: string;
  isActive?: boolean;
}>;

export type AdminHotelPartnerListResult = Readonly<{
  total: number;
  partners: AdminHotelPartnerListItem[];
}>;

export type AdminHotelPartnerOption = Readonly<{
  id: string;
  name: string;
  isActive: boolean;
}>;
