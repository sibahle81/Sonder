import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export function maximumPayableAmount(maxAamount: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlAmount = control.value;

    if (controlAmount > maxAamount) {
      return {
        allowedPaymentExceeded: true,
      };
    }
  
   //amount not exceeded
    return  null;
  };
};
