import { TransactionTypeEnum } from '../enum/transactionTypeEnum';

export class InvoiceAllocation {
    invoiceAllocationId: number;
    transactionId: number;
    invoiceId: number;
    dateTime: Date;
    claimRecoveryId: number;
    amount: number;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    transactionType: TransactionTypeEnum;
    documentNumber: string;
    isDeleted: boolean;
}
