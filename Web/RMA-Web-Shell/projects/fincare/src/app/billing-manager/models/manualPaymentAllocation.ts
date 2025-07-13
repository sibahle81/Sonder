import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { TransactionTypeEnum } from '../../shared/enum/transactionTypeEnum';
import { InterDebtorTransfer } from './interDebtorTransfer';
import { Refund } from './refund';
import { Transaction } from './transaction';

export class ManualPaymentAllocation {
  unallocatedPaymentId: number;
  InvoiceId: number;
  allocatedAmount: number;
  rolePlayerId: number;
  allocationType: string;
  unallocatedTransactionId: number;
  reference: string;
  isClaimRecoveryPayment: boolean;
  claimRecoveryInvoiceId: number;
  periodStatus: PeriodStatusEnum;
  leaveBalanceInSuspenceAccount = true;
  transactionType: TransactionTypeEnum;
  linkedInterDebtorTransfer: InterDebtorTransfer;
  linkedRefund: Refund;
  debitTransaction: Transaction;
  linkedPayment: Transaction;
}
