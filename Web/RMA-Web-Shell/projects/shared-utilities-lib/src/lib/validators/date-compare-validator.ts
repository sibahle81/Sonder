import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

export class DateCompareValidator {

    static compareDates(date1: Date, date2: Date, validationMessage: string, validationResult: ValidationResult): any {

        if (date2 < date1) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push(validationMessage);
        }

    }
    static validateDateIfLessthanOrEqual(date1: Date, date2: Date, validationMessage: string, validationResult: ValidationResult): any {

        if (date2 <= date1) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push(validationMessage);
        }

    }

    static compareIfDatesAreEqual(date1: Date, date2: Date, validationMessage: string, validationResult: ValidationResult): any {
        if(date2 !== date1) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push(validationMessage);
        }
    }
}
