import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
export class ProductOptionBillingIntegration {
  productOptionBillingIntegrationId: number;
  productOptionId: number;
  industryClass: IndustryClassEnum;
  allowTermsArrangement: boolean;
  accumulatesInterest: boolean;
}
