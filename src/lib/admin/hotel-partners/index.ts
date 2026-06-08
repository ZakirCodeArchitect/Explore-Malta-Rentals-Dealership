export {
  listAdminHotelPartners,
  listAdminHotelPartnerOptions,
  getAdminHotelPartnerById,
} from "@/lib/admin/hotel-partners/listAdminHotelPartners";
export {
  createAdminHotelPartner,
  deactivateAdminHotelPartner,
  deleteAdminHotelPartner,
  updateAdminHotelPartner,
} from "@/lib/admin/hotel-partners/mutateAdminHotelPartner";
export {
  adminHotelPartnerCreateSchema,
  adminHotelPartnerListQuerySchema,
  adminHotelPartnerWriteSchema,
  type AdminHotelPartnerCreateInput,
  type AdminHotelPartnerWriteInput,
  type AdminInitialHotelCodeInput,
} from "@/lib/admin/hotel-partners/hotel-partner-schema";
export type {
  AdminHotelPartnerDetail,
  AdminHotelPartnerListFilters,
  AdminHotelPartnerListItem,
  AdminHotelPartnerListResult,
  AdminHotelPartnerOption,
} from "@/lib/admin/hotel-partners/types";
