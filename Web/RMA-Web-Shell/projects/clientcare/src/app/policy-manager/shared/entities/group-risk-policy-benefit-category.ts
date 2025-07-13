import { FuneralCoverTypeEnum } from '../enums/funeral-cover-type.enum';
import { BenefitCategoryFuneral } from './benefit-category-funeral';
import { PolicyBenefitCategoryOption } from './policy-benefit-category-option';

export class GroupRiskPolicyBenefitCategory {
  benefitId: number;
  startDate: Date;
  newEffectiveDate: Date;
  endDate?: Date;
  categoryDescription: string;
  name: string;
  flatCoverAmount: number;
  employerWaiver: number;
  salaryMultiple: number;
  policyId: number;
  categoryOptions: PolicyBenefitCategoryOption[];
  funeralCoverTypeId?: FuneralCoverTypeEnum;
  funeralScales: BenefitCategoryFuneral[];
  benefitCategoryId: number;
  categoryDetailsEffectiveDates: Date[];

  constructor() {
    this.categoryOptions = [];
  }
}
