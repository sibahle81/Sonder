import { BaseClass } from "./base-class";

export class PayeeType extends BaseClass {
    payeeTypeId: number;
    name: string;
    description: string;
    isSundry: boolean;
    isMedical: boolean;
    isPD: boolean;
    isFatal: boolean;
    isDaysOff: boolean;
    isFuneralBenefit: boolean;
    isPension: boolean;
  }