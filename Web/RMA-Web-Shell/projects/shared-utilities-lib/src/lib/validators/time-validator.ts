import { FormControl, Validators, ValidatorFn, AbstractControl} from '@angular/forms';

export class TimeValidators extends Validators {

  static isTimeBefore(timeStr: string): ValidatorFn {
    return(control: AbstractControl): {[key: string]: boolean} | null => {
    if (control.value !== undefined && (isNaN(control.value)) || control.value > timeStr) {
        return {
          isTimeBefore: true
        };
      }
    return null;
    };
  }
  static isTimeAfter(timeStr: string): ValidatorFn {
    return(control: AbstractControl): {[key: string]: boolean} | null => {
    if (control.value !== undefined && (isNaN(control.value)) && (control.value < timeStr)) {
        return {
          isTimeAfter: true
        };
      }
    return null;
    };
  }
}
