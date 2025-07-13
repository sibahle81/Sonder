import {
  BenefitPayrollStatusTypeEnum
} from "../../../../../../shared-models-lib/src/lib/enums/benefit-payroll-status-type-enum";

export class BenefitPayroll {
    rowId : number;
    benefitPayrollId: number;
    benefitDetailId: number;
    benefitCategory: string;
    rolePlayerId: number;
    policyId: number;
    effectiveDate: Date;
    linkedBenefitPayrollId: number;
    monthlySalary: number;
    sumAssured: number;
    noOfMembers: number;
    fixedSum: number;
    payrollStatusType: BenefitPayrollStatusTypeEnum;
    billingLevel : string
    billingLevelCode : string
    benefitCategoryId: number;
    billingRate: number;
    billingMethod : string;
    billingMethodCode : string;
    premiumDue : number;
    lastUpdatedDate : Date;
    fixedPremium : number;
    benefitId: number;

  }
