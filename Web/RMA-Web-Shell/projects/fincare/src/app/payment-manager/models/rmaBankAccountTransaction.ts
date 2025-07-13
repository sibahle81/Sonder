import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { UnallocatedBankImportPayment } from './unallocatedBankImportPayment';

export class RmaBankAccountTransaction {
  rmaBankAccountId: number;
  product: Product;
  description: string;
  accountNumber: string;
  transactions: UnallocatedBankImportPayment[];
 }
