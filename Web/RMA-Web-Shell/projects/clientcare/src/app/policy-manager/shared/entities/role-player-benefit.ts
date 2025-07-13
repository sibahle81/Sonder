import { Benefit } from '../../../product-manager/models/benefit';

export class RolePlayerBenefit extends Benefit {
  rolePlayerName: string;
  memberType: string;
  age: number;
  ageIsYears: boolean;
  benefitName: string;
  productOptionName: string;
  isStatedBenefit: boolean;
}
