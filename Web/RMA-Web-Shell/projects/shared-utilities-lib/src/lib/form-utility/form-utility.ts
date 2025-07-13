import { UntypedFormGroup } from '@angular/forms';

export class FormUtil {
    getDisabledFieldsData(form: UntypedFormGroup): any {
      let disabledFieldsData = {};
      const formFieldKeys = Object.keys(form.controls);
      formFieldKeys.forEach((key) => {
        if (form.controls[key].disabled) {
          disabledFieldsData[key] = form.controls[key].value;
        }
      });

      return disabledFieldsData;
    }
}
