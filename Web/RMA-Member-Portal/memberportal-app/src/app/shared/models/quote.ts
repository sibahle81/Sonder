
import { CaseType } from "../enums/case-type.enum";
import { CategoryInsuredEnum } from "../enums/categoryInsuredEnum";
import { ProductClassEnum } from "../enums/product-class-enum";
import { DependentQuote } from "./dependent-quote";
import { QuoteAllowance } from "./quote-allowance";
export class Quote {
  quoteId: number;
  quoteNumber: string;
  tenantId: number;
  quoteStatusId: number;
  declineReason: string;
  productId: number;
  productOptionId: number;
  productClass: ProductClassEnum;

  caseType: CaseType;
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
