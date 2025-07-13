import { AbstractControl } from '@angular/forms';

export function ValidateMobileNumber(control: AbstractControl) {
    if (control == null || control.value == null || control.value === '') { return null; }

    var mobileNumberRegex =
        new RegExp(/^(\d{10,15})$/);

    if (mobileNumberRegex.test(control.value)) {
        return null;
    }

    return { mobileNumber: true };
}
