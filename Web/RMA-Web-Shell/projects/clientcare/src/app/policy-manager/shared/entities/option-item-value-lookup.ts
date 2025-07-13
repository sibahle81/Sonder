import { OptionItemFieldEnum } from "../enums/option-item-field.enum";

export class OptionItemValueLookup {
  benefitOptionItemValueId: number;
  benefitId: number;
  optionItemName: string;
  optionItemCode: string;
  optionTypeCode: string;
  optionItemField: OptionItemFieldEnum;
  overrideValue: number;
}
