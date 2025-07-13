import { FormControl } from '@angular/forms';

export interface OverPaymentForm {
  ledgerId: FormControl<number | null>;
  deceasedNames: FormControl<string | null>;
  dateOfDeath: FormControl<Date | null>;
  lastPaymentDate: FormControl<Date | null>;
  normalMonthlyPension: FormControl<number | null>;
  overpaymentAmount: FormControl<number | null>;
}
