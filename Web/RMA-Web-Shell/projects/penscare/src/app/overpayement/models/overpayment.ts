import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { OverPaymentStatusEnum, OutstandingOverpaymentTypeEnum } from "../lib/enums/overpayment-enums";

export class OverPayment extends BaseClass {
  ledgerId: number;
  amount: number; //overpayment amount
  vATAmount: number; //write off amount
  pAYEAmount: number;// deduction history
  sITEAmount: number;// amount recover
  additionalAmount: number;// overpayment balance
  dateOfDeath: string;
  status: OverPaymentStatusEnum;
  type: OutstandingOverpaymentTypeEnum;
  rolePlayerId: number;
}

export class OutstandingOverpayment extends BaseClass {
  ledgerId: number;
  deceasedNames: string;
  dateOfDeath: string;
  lastPaymentDate: string;
  normalMonthlyPension: number;
  overpaymentAmount: number;
  amountRecovered: number;
  writeOffAmount: number;
  outstandingOverpaymentId: number;
  overpaymentBalanceAmount : number
}

export class OverPaymentsWriteOff extends BaseClass {
  overPaymentId: number;
  amount: number;

  constructor(id: number, amount: number) {
    super();
    this.overPaymentId = id;
    this.amount = amount;
  }
}

