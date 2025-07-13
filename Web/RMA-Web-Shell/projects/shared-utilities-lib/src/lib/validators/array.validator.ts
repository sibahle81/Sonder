import { AbstractControl } from '@angular/forms';

export class ArrayValidator {

    static minLength(length: number): any {
        return (control: AbstractControl): any => {
            if (control == null || control.value == null || control.value === '') {
                if (length > 0) {
                    return { minLength: true };
                }
            } else if (control.value.length < length) {
                return { minLength: true };
            }
            return null;
        };
    }

    static maxLength(length: number): any {
        return (control: AbstractControl): any => {
            if (control == null || control.value == null || control.value === '') {
                return null;
            } else if (control.value.length > length) {
                return { maxLength: true };
            }
            return null;
        };
    }
}
