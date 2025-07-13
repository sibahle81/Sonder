import { FormControl } from "@angular/forms";

export interface BonusPaymentForm {
  increaseType: FormControl<string|null>,
  legislativeValue: FormControl<number|null>,
  amountType: FormControl<string|null>,
  effectiveDate: FormControl<Date|null>,
  increaseAmount: FormControl<number|null>,
  increasePercent: FormControl<number|null>,
  description: FormControl<string|null>,
}
