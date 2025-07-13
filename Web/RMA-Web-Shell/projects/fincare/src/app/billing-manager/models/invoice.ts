import { SourceModuleEnum, SourceProcessEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { TermArrangement } from './term-arrangement';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { InvoiceLineItems } from '../../shared/models/invoice-line-items';
import { Transactions } from '../../shared/models/transactions';
import { Collections } from '../../shared/models/collections';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

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
}
