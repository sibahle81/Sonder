import { AbstractControl } from '@angular/forms';

export function ValidateIdNumber(control: AbstractControl) {
    if (control == null || control.value == null || control.value === '') { return null; }

    const idRegex = new RegExp(
           // tslint:disable-next-line:max-line-length
           /^(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/);

    if (control.value === 1111111111111) {
        return { idNumber: true };
    }

    if (control.value.length > 13) {
      return { idNumber: true };
    }

    if (idRegex.test(control.value)) {
        return null;
    }

    return { idNumber: true };
}
