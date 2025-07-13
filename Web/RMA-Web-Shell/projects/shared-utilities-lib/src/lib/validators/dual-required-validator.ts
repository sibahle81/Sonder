// Validates that either one of two controls have a value

import { AbstractControl } from '@angular/forms';

export class DualRequiredValidator {

    static Match(secondControlName: string): any {

        return (abstractControl: AbstractControl): any => {
            if (!abstractControl.parent) {
                return null;
            }
            const firstControl = abstractControl;
            const secondControl = abstractControl.parent.get(secondControlName);

            if ((firstControl.value == null || firstControl.value === '') && (secondControl.value == null || secondControl.value === '')) {
                firstControl.markAsTouched();
                secondControl.markAsTouched();

                firstControl.setErrors({ eitherRequired: true });
                secondControl.setErrors({ eitherRequired: true });
            } else {
                if (firstControl.value != null && firstControl.value !== '') {
                    secondControl.setErrors(null);
                }

                if (secondControl.value != null && secondControl.value !== '') {
                    firstControl.setErrors(null);
                }

                return null;
            }
        };
    }
}
