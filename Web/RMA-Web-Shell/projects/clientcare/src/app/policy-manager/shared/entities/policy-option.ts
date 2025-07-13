import { OptionItemFieldEnum } from "../enums/option-item-field.enum";

export class PolicyOption {
  policyOptionId: number;
  policyId: number;
  productOptionOptionItemValueId: number;
  overrideValue: number;
  optionItemField: OptionItemFieldEnum;

  constructor(productOptionOptionItemValueId: number, overrideVal: number = null) {
    this.productOptionOptionItemValueId = productOptionOptionItemValueId;
    this.overrideValue = overrideVal;
  }
}
