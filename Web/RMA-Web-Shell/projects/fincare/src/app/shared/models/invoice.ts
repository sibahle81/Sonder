import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { Collections } from './collections';
import { InvoiceLineItems } from './invoice-line-items';
import { Transactions } from './transactions';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { SourceModuleEnum, SourceProcessEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { TermArrangement } from '../../billing-manager/models/term-arrangement';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';

export class Invoice extends BaseClass {
    invoiceId: number;
    policyId: number;
    collectionDate: Date;
    totalInvoiceAmount: number;
    balance: number;
    invoiceStatus: InvoiceStatusEnum;
    invoiceNumber: string;
    invoiceDate: Date;
    notificationDate: Date;
    sourceModule: SourceModuleEnum;
    sourceProcess: SourceProcessEnum;
  
    invoiceLineItems: InvoiceLineItems[];
    transactions: Transactions[];
  
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
  
    termArrangements: TermArrangement[];
    collections: Collections[];
    selected: boolean;
    notes: Note[];
}
