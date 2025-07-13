import { Guid } from "projects/shared-utilities-lib/src/lib/guid/guid";

export class PaymentStagingRecordFile {
    fileName: string;
    company: string;
    paymentMonthYear: string;
    totalPayment: number;
    totalPaymentReceived: number;
    collectionFeePercentage: number;
    collectionFeeAmount: number;
    collectionFeeVatPercentage: number;
    collectionFeeVatAmount: number;
  }
  