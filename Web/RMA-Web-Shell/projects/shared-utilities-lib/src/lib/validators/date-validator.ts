import { AbstractControl } from '@angular/forms';
import * as moment from 'moment';

export class DateValidator {

    static checkIfDateLessThan(controlName: string, comparedDate: string): any {

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
                    return { inValidDate: true };
                }
            }
            return null;
        };
    }

    static compareTwoDatesDifference(controlName: string, comparedDate: string, noOfDays: number): any {

        return (abstractControl: AbstractControl): any => {
            if (!abstractControl.parent) { return null; }
            const startDate = abstractControl.parent.get(controlName);
            if (!startDate) { return null; }

            if (startDate.value) {
                const startDtm =  new Date(startDate.value);
                const endDtm =  new Date(comparedDate);
                startDtm.setHours(0, 0, 0);
                endDtm.setHours(0, 0, 0);
                startDate.setErrors(null);
                const dateDiff = this.getdateDiff(startDtm, endDtm);
                if (dateDiff <= noOfDays) {
                    return { invalidDateFromDateTo: true };
                }
            }
            return null;
        };
    }

    static getdateDiff(dateOffFrom: Date, dateOffTo: Date) {
        let firstDate = moment(dateOffFrom);
        let secondDate = moment(dateOffTo);
        return Math.abs(firstDate.diff(secondDate, 'days')) + 1;
    }
}
