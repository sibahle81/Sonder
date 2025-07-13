import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class InterBankTransfer extends BaseClass {
      bankImportId: number;
      sourceBank: string;
      description: string;
      date: string;
      bankAccount: string;
      targetBank: string;
      transactionReference: string;
      originalAmountPaid: number;
      transferAmount: number;
}
