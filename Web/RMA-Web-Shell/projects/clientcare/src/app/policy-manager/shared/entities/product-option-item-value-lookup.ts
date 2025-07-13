import { OptionItemFieldEnum } from "../enums/option-item-field.enum";

export class ProductOptionItemValueLookup {
  productOptionOptionItemValueId: number;
  productOptionId: number;
  optionItemName: string;
  optionTypeCode: string;
  optionItemField: OptionItemFieldEnum;
  optionItemCode: string;
  overrideValue: number;
}
