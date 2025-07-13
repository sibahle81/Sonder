import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { Transactions } from './transactions';

export class TransactionTypeLink extends BaseClass {
    name: string;
    isDebit: boolean;
    transactions: Transactions[];
}
