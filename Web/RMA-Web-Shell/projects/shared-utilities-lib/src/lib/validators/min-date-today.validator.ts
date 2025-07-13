import { AbstractControl } from '@angular/forms';

export function ValidateMinDateToday(control: AbstractControl) {
    if (control == null || control.value == null || control.value === '') { return null; }

    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);

    const today = new Date(dtm).getTime();
    const selectedDate = new Date(control.value).getTime();

    if (selectedDate < today) {
      return { minDateToday: true };
    }
}
