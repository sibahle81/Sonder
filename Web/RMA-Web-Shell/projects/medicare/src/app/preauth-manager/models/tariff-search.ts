import { TariffBaseUnitCost } from "../../medical-invoice-manager/models/tariff-base-unit-cost";

export class TariffSearch
{
  tariffId: number;
  tariffCode: string;
  tariffTypeId: number;
  tariffType: string;
  tariffDescription: string;
  practitionerTypeId: number;
  practitionerType: string;
  tariffDate: Date;
  includeNappi: boolean;
  medicalItemId: number;
  defaultQuantity: number;
  tariffAmount: number;
  treatmentCodeId: number;
  isAdmissionCode: boolean;
  isFullDayAlways: boolean;
  levelOfCareId: number;
  tariffBaseUnitCostTypeId: number;
  publicationId: number;
  isModifier: boolean;

  tariffBaseUnitCost: TariffBaseUnitCost;
}