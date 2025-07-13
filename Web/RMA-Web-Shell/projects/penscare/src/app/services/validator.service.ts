import { Injectable } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import * as moment from "moment";
import { Moment } from "moment";

@Injectable()
export class ValidatorService {
  private formErrorTypes = ['required', 'email', 'pattern']

  formValidationMessages(formControls: any, validationMessage: any): string {
    let error_message = '',
        controls = Object.keys(formControls);

    for (let i = 0; i < controls.length; i++) {
      let control = formControls[controls[i]];
      if (control.invalid) {
        let error_status = false
        for (let j = 0; j < this.formErrorTypes.length; j++) {
          if(control.hasError(this.formErrorTypes[j])) {
            if (validationMessage[controls[i]] && validationMessage[controls[i]][this.formErrorTypes[j]]) {
                error_message = validationMessage[controls[i]][this.formErrorTypes[j]];
                error_status = true;
            }
            break;
          }
        }
        if (!error_status) {
          error_message = ((validationMessage[controls[i]] &&  validationMessage[controls[i]]['disp']) || controls[i]) + 'is invalid';
        }
        break;
      }
    }


    return error_message;
  }

  capsCheck(event: any): void {
    let pattern = /[A-Za-z0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) event.preventDefault();
  }

  mobileEntryCheck(event: any, currentValue: string): void {
    let pattern = /[0-9]/;
    let len = currentValue?.length;
    let inputChar = String.fromCharCode(event.charCode);
    if (len === 10 || !pattern.test(inputChar)) event.preventDefault();
  }

  yearEntryCheck(event: any, currentValue: string): void {
    let pattern = /[0-9]/;
    let len = currentValue.length;
    let inputChar = String.fromCharCode(event.charCode);
    if (len === 4 || !pattern.test(inputChar)) event.preventDefault();
  }

  creditCardNumberCheck(event: any, currentValue: string): void {
    let pattern = /[0-9]/;
    let len = currentValue.length;
    let inputChar = String.fromCharCode(event.charCode);
    if (len === 16 || !pattern.test(inputChar)) event.preventDefault();
  }

  numberEntryCheck(event: any): void {
    let pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) event.preventDefault();
  }

  decimalEntryCheck(event: any): void {
    let pattern = /[0-9.]/; // modified pattern to include period
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) event.preventDefault();
  }


  accNumberCheck(event: any, currentValue: string) {
    let pattern = /[0-9]/;
    let len = currentValue.length;
    let inputChar = String.fromCharCode(event.charCode);
    if (len === 11 || !pattern.test(inputChar)) event.preventDefault();
  }

  inputNameCheck(
    event: any,
    inputType: string,
    allowSpace = false,
    allowChar?: boolean
  ): void {
    let pattern = null;
    let inputChar = String.fromCharCode(event.charCode);
    switch (inputType) {
      case 'string': {
        if (!allowChar) pattern = allowSpace ? /[a-zA-]/ : /[a-zA-Z]/;
        else pattern = allowSpace ? /^[a-zA-Z-']*$/g : /[A-Za-z]/;
        break;
      }
      case 'number': {
        pattern = /[0-9]/;
        break;
      }
    }

    if (!pattern.test(inputChar)) event.preventDefault();
  }

  validateDate(year: string, month: string): boolean {
    if (!year || !month) return false;

    let given_date = new Date(parseInt(year), parseInt(month), 1);
    let current_date = new Date();

    if (given_date > current_date) return false;
    else return true;
  }

  restrictSpace(event): boolean {
    var k = event ? event.which : window.event['keyCode'];
    if (k == 32) return false;
  }

  minDateValidator(minDate: Moment) {
    return (control: UntypedFormControl) => {
      return moment(control.value, 'YYMMDD').isBefore(minDate)
        ? { inValidMinDate: true }
        : null;
    };
  }

  maxDateValidator(maxDate: Moment) {
    return (control: UntypedFormControl) => {
      return moment(control.value, 'YYMMDD').isAfter(maxDate)
        ? { inValidMaxDate: true }
        : null;
    };
  }
}
