import { Product } from 'projects/clientcare/src/app/product-manager/models/product';

export class RmaBankAccount {
  rmaBankAccountId: number;
  product: Product;
  description: string;
  accountNumber: string;
  searchFilter: string;
}
