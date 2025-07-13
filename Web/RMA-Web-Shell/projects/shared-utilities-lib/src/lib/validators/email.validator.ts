import { AbstractControl } from '@angular/forms';

export function ValidateEmail(control: AbstractControl) {
    if (control == null || control.value == null || control.value === '') { return null; }

    const idRegex =
        new RegExp(/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);

    if (idRegex.test(control.value)) {
        return null;
    }
    return { email: true };
}
