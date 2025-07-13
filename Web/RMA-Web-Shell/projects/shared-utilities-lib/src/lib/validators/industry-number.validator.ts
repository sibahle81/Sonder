import { Injector } from '@angular/core';
import { FormControl, Validators, ValidatorFn, AbstractControl} from '@angular/forms';

export class IndustryNumberValidators extends Validators {
  static isIndustryNumberUnique(isUnique: boolean): ValidatorFn {
    return(control: AbstractControl): {[key: string]: boolean} | null => {
    if (control.value !== undefined && isUnique) {
        return {
            isIndustryNumberUnique: true
        };
      }
    return null;
    };
  }
}
