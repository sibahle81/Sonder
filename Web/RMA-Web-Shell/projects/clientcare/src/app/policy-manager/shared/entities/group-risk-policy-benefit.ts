import { BenefitGroupEnum } from '../../../product-manager/models/benefit-group.enum';
import { GroupRiskPolicyBenefitCategory } from '../entities/group-risk-policy-benefit-category'
import { PolicyBenefitOption } from './policy-benefit-option';

export class GroupRiskPolicyBenefit {
  startDate: Date;
  endDate?: Date;
  newEffectiveDate: Date;
  benefitId: number;
  glCode: string;

  benefitOptions: PolicyBenefitOption[] = [];
  benefitCategories: GroupRiskPolicyBenefitCategory[];
  benefitDetailsEffectiveDates: Date[];

  policyId: number;
  benefitName: string;
  benefitGroup: BenefitGroupEnum;
  benefitCode: string;
  policyNumber: string;
  benefitDetailId: number;
  
}









