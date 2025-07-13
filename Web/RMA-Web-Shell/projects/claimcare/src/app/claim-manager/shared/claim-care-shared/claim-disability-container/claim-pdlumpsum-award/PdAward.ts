import { ClaimInvoice } from "../../../entities/claim-invoice.model";

export class PdAward{
    pdAwardId : number;
    claimId : number; 
    payeeId : number;
    medicalAssessmentId: number;
    awardStatusId : number;
    awardPercentage : number;
    awardAmount : number;
    isActive : number;
    isDeleted : number;
    createdBy : string;
    createdDate : Date;
    modifiedBy : string;
    modifiedDate : Date;
    claimInvoice: ClaimInvoice;
}