import { CategoryInsuredEnum } from '../enums/categoryInsuredEnum';
export class RateIndustry {
  id: number;
  industry: string;
  industryGroup: string;
  empCat: string;
  skillSubCategory: CategoryInsuredEnum;
  indRate: number;
  previousYear: number;
  previousYearRate: number;
  ratingYear: number;
  premiumPerMember: number;
  loadDate: Date;
}
