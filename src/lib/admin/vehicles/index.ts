export { listAdminVehicles, getAdminVehicleById } from "@/lib/admin/vehicles/listAdminVehicles";
export { getAdminVehicleBookingsForCalendar } from "@/lib/admin/vehicles/getAdminVehicleBookingsForCalendar";
export {
  createAdminVehicle,
  deactivateAdminVehicle,
  deleteAdminVehicle,
  DuplicateLicensePlateError,
  updateAdminVehicle,
} from "@/lib/admin/vehicles/mutateAdminVehicle";
export { defaultPricingForVehicleType } from "@/lib/admin/vehicles/pricing-defaults";
export { slugifyVehicleName } from "@/lib/admin/vehicles/slugify-name";
export { ensureUniqueVehicleSlug } from "@/lib/admin/vehicles/slug";
export {
  adminVehicleListQuerySchema,
  adminVehicleWriteSchema,
  type AdminVehicleWriteInput,
} from "@/lib/admin/vehicles/vehicle-schema";
export {
  VEHICLE_CATALOG_STATUSES,
  VEHICLE_TYPES,
  type AdminVehicleDetail,
  type AdminVehicleListFilters,
  type AdminVehicleListItem,
} from "@/lib/admin/vehicles/types";
export { uploadAdminVehicleImage } from "@/lib/admin/vehicles/upload-vehicle-image";
