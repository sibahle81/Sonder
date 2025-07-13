import { QuoteStatusEnum } from "../../policy-manager/shared/enums/quote-status.enum";
import { QuoteDetailsV2 } from "./quoteDetailsV2";

export class QuoteV2 {
  quoteId: number;
  tenantId: number;
  leadId: number;
  underwriterId: number;
  productId: number;
  quotationNumber: string;
  quoteStatus: QuoteStatusEnum;
  declineReason: string;
  totalPremium: number;

  quoteDetailsV2: QuoteDetailsV2[];

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
