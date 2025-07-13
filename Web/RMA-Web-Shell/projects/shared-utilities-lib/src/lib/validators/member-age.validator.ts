import { AbstractControl } from '@angular/forms';

export function ValidateMemberAge(control: AbstractControl) {
    if (control == null || control.value == null || control.value === '') { return null; }

    const age = parseInt(control.value, 10);

    if (age >= 18 && age <= 86) {
        return null;
    }

    return { memberAge: true };
}
