import { AbstractControl } from '@angular/forms';

export function ValidateRegistrationNumber(control: AbstractControl) {
    if (control == null || control.value == null || control.value === '') { return null; }

    const registrationRegex =
        new RegExp(/^\d{4}\/\d{6}\/\d{2}$/);

    if (registrationRegex.test(control.value)) {
        return null;
    }

    return { registrationNumber: true };
}