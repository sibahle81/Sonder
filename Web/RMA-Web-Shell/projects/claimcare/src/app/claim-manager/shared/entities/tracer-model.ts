import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

export class TracerModel {
  claimId: number;
  rolePlayer: RolePlayer;
  totalAmountPaid: number;
  funeralTracingMaxAmount: number;

  rolePlayerBankingDetails: RolePlayerBankingDetail;
}


export class ClaimTracerPaymentModel {
  tracerInvoiceId: number;
  claimId: number;
  rolePlayerId: number;
  tracingFee: number;
  paymentStatusId: number;
  reason: string;
  payDate: any;
  claimInvoiceType: number;
  invoiceDate: Date;
  capturedDate: Date;
  productId: number;
  bankAccountId: number;
  tracerEmail: string;
}