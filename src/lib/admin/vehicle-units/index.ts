export {
  getAdminVehicleUnitCounts,
  getAdminVehicleUnitCountsByVehicleIds,
  listAdminVehicleUnits,
} from "@/lib/admin/vehicle-units/listAdminVehicleUnits";
export { getAdminVehicleUnitDetail } from "@/lib/admin/vehicle-units/getAdminVehicleUnitDetail";
export {
  createAdminVehicleUnit,
  deleteAdminVehicleUnit,
  DuplicateVehicleUnitLicensePlateError,
  VehicleUnitHasActiveBookingError,
  updateAdminVehicleUnit,
  type DeleteAdminVehicleUnitResult,
} from "@/lib/admin/vehicle-units/mutateAdminVehicleUnit";
export {
  adminVehicleUnitWriteSchema,
  VEHICLE_UNIT_STATUSES,
  type AdminVehicleUnitWriteInput,
} from "@/lib/admin/vehicle-units/vehicle-unit-schema";
export type {
  AdminVehicleUnitDto,
  AdminVehicleUnitCounts,
  AdminVehicleUnitDetailDto,
  AdminVehicleUnitBookingItem,
  AdminVehicleUnitHoldItem,
} from "@/lib/admin/vehicle-units/types";
