export class MedicalSwitchBatchSearchPersonEvent {
    industryNumber:string;
    coEmployeeNo:string;
    surname:string;
    pensionNumber:string;
    fullFirstName:string;
    passPortNumber:string;
    initials:string;
    passportNationality:number;
    idNumber:string;
    eventId:number;
    personEventId:number;
    claimId:number;
    claimReferenceNumber:string;
    otherIdentification:string;
    mainClaimRefNo:string;
    dateOfBirth?:any;
    dateOfEvent?: any;
    eventDescription: string;
    accidentDetailPersonEventId: number;
    isFatal: boolean;
}
