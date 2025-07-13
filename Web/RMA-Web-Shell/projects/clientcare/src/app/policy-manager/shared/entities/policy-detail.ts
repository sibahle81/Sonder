import {PaymentFrequencyEnum} from "../../../../../../shared-models-lib/src/lib/enums/payment-frequency.enum";

export class PolicyDetail {
  policyDetailId: number;
  policyId: number;
  effectiveDate: Date;
  policyAnniversaryMonth: number;
  policyName: string;
  paymentFrequency: PaymentFrequencyEnum | null;
  policyAdministratorId: number;
  policyConsultantId: number;
  policyHolderId: number | null;
  quoteId: number | null;
  lastReviewDate: Date | null;
  nextReviewDate: Date | null;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

}

