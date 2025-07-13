import { IndustryClassEnum } from "../enums/industry-class.enum";

export class ProductOptionDependency {
  productOptionDependencyId: number;
  productOptionId: number;
  childOptionId: number;
  industryClass: IndustryClassEnum;
  childPremiumPecentage: number;
  quoteAutoAcceptParentAccount: boolean;
}
