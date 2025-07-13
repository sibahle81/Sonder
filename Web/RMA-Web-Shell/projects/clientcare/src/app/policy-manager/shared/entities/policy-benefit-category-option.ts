import { OptionItemFieldEnum } from "../enums/option-item-field.enum";

export class PolicyBenefitCategoryOption {
  categoryOptionId: number;
  benefitCategoryId: number;
  benefitOptionItemValueId: number;
  overrideValue: number = null;
  optionItemField: OptionItemFieldEnum;
  constructor(valueId: number,  value: number = null) {
    this.benefitOptionItemValueId = valueId;
    this.overrideValue = value;
  }
}
