import { AbstractControl } from '@angular/forms';

export class ConsultationDateValidator {

    static firstConsultationDateLessThan(controlName: string, comparedDate: string): any {

        return (abstractControl: AbstractControl): any => {
            if (!abstractControl.parent) { return null; }
            const startDate = abstractControl.parent.get(controlName);
            if (!startDate) { return null; }

            if (startDate.value) {
                const startDtm =  new Date(startDate.value);
                const endDtm =  new Date(comparedDate);
                endDtm.setHours(0, 0, 0);
                startDate.setErrors(null);
                if (startDtm < endDtm) {
                    return { inValidFirstDate: true };
                }
            }
            return null;
        };
    }

    static progressConsultationDateLessThan(controlName: string, comparedDate: string): any {

        return (abstractControl: AbstractControl): any => {
            if (!abstractControl.parent) { return null; }
            const startDate = abstractControl.parent.get(controlName);
            if (!startDate) { return null; }

            if (startDate.value) {
                const startDtm =  new Date(startDate.value);
                const endDtm =  new Date(comparedDate);
                endDtm.setHours(0, 0, 0);
                startDate.setErrors(null);
                if (startDtm < endDtm) {
                    return { inValidProgressDate: true };
                }
            }
            return null;
        };
    }

}
