import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { CaseTypeEnum } from '../../policy-manager/shared/enums/case-type.enum';
import { CategoryInsuredEnum } from '../../policy-manager/shared/enums/categoryInsuredEnum';
import { DependentQuote } from './dependent-quote';
import { QuoteAllowance } from './quote-allowance';

export class Quote {
  quoteId: number;
  quoteNumber: string;
  tenantId: number;
  quoteStatusId: number;
  declineReason: string;
  productId: number;
  productOptionId: number;
  productClass: ProductClassEnum;

  caseType: CaseTypeEnum;
  parentQuoteId: number;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  rate: number;
  categoryInsured: CategoryInsuredEnum;
  averageEmployeeCount: number;
  averageEarnings: number;
  premium: number;
  quoteAllowances: QuoteAllowance[];
  dependentQuotes: DependentQuote[];
}
