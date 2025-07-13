import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { InsuredLifeStatusEnum } from '../enums/insured-life-status.enum';
import { BenefitRate } from '../../../product-manager/models/benefit-benefitRate';

export class PolicyGroupMember {
  policyId: number;
  policyNumber: string;
  clientReference: string;
  rolePlayerId: number;
  rolePlayerType: RolePlayerTypeEnum;
  memberName: string;
  idNumber: string;
  dateOfBirth: Date;
  dateOfDeath: Date;
  policyJoinDate: Date;
  insuredLifeStatus: InsuredLifeStatusEnum;
  premium: number;
  coverAmount: number;
  statedBenefitId: number;
  benefitRate: BenefitRate;
}
