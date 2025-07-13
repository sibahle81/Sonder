import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';

export class FormValidation {

    static markFormTouched(group: UntypedFormGroup | UntypedFormArray) {
        Object.keys(group.controls).forEach((key: string) => {
          const control = group.controls[key];
          if (control instanceof UntypedFormGroup || control instanceof UntypedFormArray) { control.markAsTouched(); this.markFormTouched(control); }
          else { control.markAsTouched(); };
        });
      };
}