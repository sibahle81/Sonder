import { Brokerage } from './brokerage';
import { BankAccount } from './bank-account';
import { Bank } from '../../../../../shared-models-lib/src/lib/lookup/bank';
import { BrokerStatementItem } from './broker-statement-item';

export class BrokerCommission {
    brokerage: Brokerage;
    brokerageId: number;
    bankAccount: BankAccount;
    bankAccountId: number;
    bank: Bank;
    nmmberOfPolicies: number;
    commission: number;
    period: string;
    exclude: boolean;
    excludeButtonText: string = 'Exclude';
    disableExclude: boolean;
    brokerCommissionDetails: BrokerStatementItem[];

    constructor() {
        this.brokerage = new Brokerage();
        this.bank = new Bank();
        this.bankAccount = new BankAccount();
        this.brokerCommissionDetails = new Array<BrokerStatementItem>();
    }
}
