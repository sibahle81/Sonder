import { validateHorizontalPosition } from "@angular/cdk/overlay";

export enum ValidationStateEnum {
    showAll = 1,
    showPartial = 2,
    validationPassed = 3,
    validationFailed = 4,
    invoiceUnderAssessReasons = 5,
    invoiceLineUnderAssessReasons  = 6,
    defaultIndex = 0

}