import { AbstractControl } from '@angular/forms';

export function isSelectRequired(control: AbstractControl) {
  if (control == null || control.value == null) { return null; }
  if (control.value === '' || control.value === false)  return {required : true}
  return null;
}

