import { FormControl } from "@angular/forms";

export interface AnnualIncreaseForm {
  increaseType: FormControl<string|null>,
  legislativeValue: FormControl<number|null>,
  amountType: FormControl<string|null>,
  effectiveDate: FormControl<Date|null>,
  fromAccidentDate: FormControl<Date|null>,
  toAccidentDate: FormControl<Date|null>,
  increaseAmount: FormControl<number|null>,
  increasePercent: FormControl<number|null>,
  description: FormControl<string|null>,
}
