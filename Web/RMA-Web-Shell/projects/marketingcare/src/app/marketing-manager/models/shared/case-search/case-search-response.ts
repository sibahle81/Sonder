export interface ClaimSearchResponse {
    response: Response;
}

export interface Response {
    claimReferenceNo: string;
    personEvents: PersonEvent[];
    sourceSystemReference: string;
    sourceSystemRoutingID: string;
    requestGUID: string;
    message: string;
    code: string;
}

export interface PersonEvent {
    claimID: number;
    personEventID: number;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    idNumber: string;
    gender: string;
    fileRefNumber: string;
    employerName: string;
    industryNumber: string;
    occupation: string;
    eventDate: Date;
    eventCategoryID: number;
    isValid: boolean;
}
