import { AbstractControl } from '@angular/forms';

export function ValidatePhoneNumber(control: AbstractControl) {
    if (control == null || control.value == null || control.value === '') { return null; }

    const phoneRegex =
        new RegExp(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/);

    if (phoneRegex.test(control.value)) {
        return null;
    }

    return { phoneNumber: true };
}
