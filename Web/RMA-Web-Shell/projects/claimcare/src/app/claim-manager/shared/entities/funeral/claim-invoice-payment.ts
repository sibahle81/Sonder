import { ClaimInvoiceStatusEnum } from "projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum";
import { CoverMemberTypeEnum } from "projects/shared-models-lib/src/lib/enums/cover-member-type-enum";

export interface ClaimInvoicePayment {
  claimId: number;
  personEventId: string;
  claimInvoiceType: string;
  benefitName: string;
  benefitCode: string;
  estimatedValue: number;
  coverMemberType: CoverMemberTypeEnum;
  invoiceAmount: number;
  authorizedAmount: number;
  invoiceDate: Date | null;
  claimInvoiceStatus: ClaimInvoiceStatusEnum;
  included: boolean;
}