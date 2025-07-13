import { AbstractControl } from '@angular/forms';

export class DateTimeRangeValidator {

    static checkEndDate(startdate: string, startDateTime: string, enddate: string ): any {

        return (abstractControl: AbstractControl): any => {
            if (!abstractControl.parent) { return null; }
            const startDate = abstractControl.parent.get(startdate).value;
            const startTime = abstractControl.parent.get(startDateTime).value;
            const endDate = abstractControl.parent.get(enddate).value;
            if (!startDate || !startTime || !endDate) { return null; }
            const endTime = abstractControl.value;

            const end = new Date(endDate);
            const start = new Date(startDate);
            const  starthours = startTime.substring(0, 2);
            const  startmins = startTime.substring(3, 5);
            const  endhours = endTime.substring(0, 2);
            const  endmins = endTime.substring(3, 5);
            end.setHours(endhours, endmins, 0);
            start.setHours(starthours, startmins, 0);
            if (end <= start) {
                return { invalidEndDate: true };
            }
            return null;

        };
    }

    static checkStartDate(startdate: string, endDateTime: string, enddate: string ): any {

        return (abstractControl: AbstractControl): any => {
            if (!abstractControl.parent) { return null; }
            const startDate = abstractControl.parent.get(startdate).value;
            const endTime = abstractControl.parent.get(endDateTime).value;
            const endDate = abstractControl.parent.get(enddate).value;
            if (!startDate || !endTime || !endDate) { return null; }
            const startTime = abstractControl.value;

            const end = new Date(endDate);
            const start = new Date(startDate);
            const  starthours = startTime.substring(0, 2);
            const  startmins = startTime.substring(3, 5);
            const  endhours = endTime.substring(0, 2);
            const  endmins = endTime.substring(3, 5);
            end.setHours(endhours, endmins, 0);
            start.setHours(starthours, startmins, 0);
            if (start >= end) {
                return { invalidStartDate: true };
            }
            return null;

        };
    }

}
