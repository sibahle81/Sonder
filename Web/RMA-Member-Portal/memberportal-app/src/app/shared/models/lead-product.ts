import { Quote } from "./quote";


export class LeadProduct {
  leadProductId: number;
  leadId: number;
  productId: number;
  productOptionId: number;
  quoteId: number;
  quote: Quote = new Quote();

  isVAP: boolean;
  appliedDependencyDescription: string;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
