export class QuoteDetail {
  quoteDetailId: number;
  quoteId: number;
  categoryInsuredId: number;
  numberOfEmployees: number;
  earnings: number;
  premium: number;
  rate: number;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
