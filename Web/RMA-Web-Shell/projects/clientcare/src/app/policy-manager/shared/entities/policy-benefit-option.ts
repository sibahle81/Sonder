import { OptionItemFieldEnum } from "../enums/option-item-field.enum";

export class PolicyBenefitOption {
  benefitOptionId: number;
  benefitDetailId: number;
  benefitOptionItemValueId: number;
  overrideValue: number;
  optionItemCode: string;
  optionItemField: OptionItemFieldEnum;
  constructor(valueId: number, overrideValue: number = null) {
    this.benefitOptionItemValueId = valueId;
    this.overrideValue = overrideValue;
  }

  public isOptionCodeIncluded(): boolean {
    return (this.optionItemCode == "Yes");
  }
}
