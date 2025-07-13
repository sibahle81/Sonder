import { AbstractControl } from '@angular/forms';
// @dynamic
export class DateRangeValidator {

    static endAfterStart(secondControlName: string): any {
        return (abstractControl: AbstractControl): any => {
            if (!abstractControl.parent) { return null; }
            const startDate = abstractControl.parent.get(secondControlName);
            if (!startDate) { return null; }
            const endDate = abstractControl;
            if (startDate.value && endDate.value) {
                const startDtm =  new Date(startDate.value);
                const endDtm =  new Date(endDate.value);
                startDate.setErrors(null);
                if (startDtm.getTime() > endDtm.getTime()) {
                    return { invalidEndDate: true };
                }
            }
            return null;
        };
    }

    static startBeforeEnd(secondControlName: string): any {
        return (abstractControl: AbstractControl): any => {
            if (!abstractControl.parent) { return null; }
            const endDate = abstractControl.parent.get(secondControlName);
            if (!endDate) { return null; }
            const startDate = abstractControl;
            if (startDate.value && endDate.value) {
                const startDtm =  new Date(startDate.value);
                const endDtm =  new Date(endDate.value);
                endDate.setErrors(null);
                if (startDtm.getTime() > endDtm.getTime()) {
                    return { invalidStartDate: true };
                }
            }
            return null;
        };
    }

}
