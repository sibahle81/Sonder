import { IndustryClassEnum } from "projects/shared-models-lib/src/lib/enums/industry-class.enum";

export class ProductOptionDependency {
  productOptionDependencyId: number;
  productOptionId: number;
  childOptionId: number;
  industryClass: IndustryClassEnum;
  childPremiumPecentage: number;
  quoteAutoAcceptParentAccount: boolean;
}
