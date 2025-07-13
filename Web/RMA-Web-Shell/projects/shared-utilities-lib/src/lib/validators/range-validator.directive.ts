// wiki: http:// bit.ly/2CSTFmk
// Validates that one value must be less than another value

import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[validateRange][formControlName],[validateRange][formControl],[validateRange][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => RangeValidatorDirective), multi: true }
    ]
})
export class RangeValidatorDirective implements Validator {
    constructor(
        @Attribute('validateRange') public validateRange: string,
        @Attribute('reverse') public reverse: string) {
    }

    private get isReverse() {
        if (!this.reverse) { return false; }
        return this.reverse === 'true';
    }

    validate(control: AbstractControl): { [key: string]: any } {
        if (this.isReverse) {
            return this.validateReverse(control);
        }
        return this.validateNormal(control);
    }

    validateNormal(control: AbstractControl): { [key: string]: any } {
        // self value (e.g. retype password)
        const upperRangeValue = control.value;

        // control value (e.g. password)
        const lowerRangeControl = control.root.get(this.validateRange);

        // value not equal
        if (lowerRangeControl && Number(lowerRangeControl.value) >= Number(upperRangeValue) && !this.isReverse) { return {
                isOutRange: true
            };
        }

        return null;
    }

    validateReverse(control: AbstractControl): { [key: string]: any } {
        // self value (e.g. retype password)
        const lowerRangeValue = control.value;

        // control value (e.g. password)
        const upperRangeControl  = control.root.get(this.validateRange);

        // value equal and reverse
        if (upperRangeControl && Number(lowerRangeValue) < Number(upperRangeControl.value)) {
            delete upperRangeControl.errors.isOutRange;
            if (!Object.keys(upperRangeControl.errors).length) { upperRangeControl.setErrors(null); }
        }

        // value not equal and reverse
        if (upperRangeControl && Number(lowerRangeValue) >= Number(upperRangeControl.value)) {
            upperRangeControl.setErrors({ isOutRange: true });
        }
        return null;
    }
}
