import { EstimateTypeEnum } from "projects/shared-models-lib/src/lib/enums/estimate-type-enum";

export class ClaimBenefitFormula {
    claimBenefitFormulaId: number;
    benefitId: number;
    eventType: EstimateTypeEnum;
    formula: string;
    claimEstimateTypeId: number;
    minEarningsFormula: string;
    maxEarningsFormula: string;
    estimatedDaysOff: number;
  }
  