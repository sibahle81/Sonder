import { AbstractControl, ValidatorFn } from '@angular/forms';

export function notBeforeEventDate(eventDate: Date): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value || !eventDate) return null;

    const selectedDate = new Date(control.value);
    const baseDate = new Date(eventDate);

    if (selectedDate < baseDate) {
      return { dateBeforeEvent: true };
    }

    return null;
  };
}
