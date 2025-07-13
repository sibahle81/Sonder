// This is an Enum that needs to be maintained manually.
// It is not linked to the backend (tt) code.
// Always ensure that the list in here matches the ones defined in the database.
export enum ClaimEarningTypeEnum {
  BasicSalary = 1,
  Housing = 2,
  AnnualBonus = 3,
  CompassionLeave = 4,
  LeavePay = 5,
  PublicHoliday = 6,
  SickPay = 7,
  OtherNonVariable = 8,
  UndergroundAllowance = 9,
  ProductionBonus = 10,
  AttendanceBonus = 11,
  AfternoonAllowance = 12,
  NightAllowance = 13,
  Overtime = 14,
  ShiftAllowance = 15,
  HolidayPay = 16,
  OtherVariable = 17
}
