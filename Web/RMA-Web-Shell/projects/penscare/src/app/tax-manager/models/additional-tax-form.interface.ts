import { FormControl } from "@angular/forms";

export interface IAdditionalTaxForm {
  individualAmount: FormControl<number|null>,
  stopOrderAmount: FormControl<number|null>,
  bothAmount: FormControl<number|null>,
  startDate: FormControl<Date|null>,
  endDate: FormControl<Date|null>,
  additionalTaxType: FormControl<number|null>,
}
