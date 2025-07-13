import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class BankAccountModel extends BaseClass {
      accountHolderName: string;
      bank: string;
      account: string;
      branchCode: string;
      accountType: string;
}
