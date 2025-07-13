export class PreauthCodeLimit {
    preAuthCodeLimitId: number;
    medicalItemCode: string;
    practitionerTypeId: number;
    isValidatePractitioner: boolean;
    authorisationQuantityLimit: number | null;
    authorisationDaysLimit: number | null;
}
