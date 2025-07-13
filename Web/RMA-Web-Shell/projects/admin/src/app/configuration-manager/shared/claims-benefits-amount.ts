export class ClaimsBenefitsAmount
{
  claimBenefitAmountId: number;
  benefitName: string;
  benefitType: number;
  description: string;
  formula:string;
  minimumCompensationAmount: string;
  maximumCompensationAmount: string;
  linkedBenefits: string;
  startDate: Date;
  endDate: Date;
  isDeleted: boolean;
  createdBy:string;
  createdDate: Date;
  modifiedBy:string;
  modifiedDate: Date;
}
