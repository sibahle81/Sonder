import { DisabilityAssessmentStatusEnum } from "projects/shared-models-lib/src/lib/enums/disability-assessment-status-enum";

export class ClaimDisabilityAssessmentResult {
    claimDisabilityAssessmentId : number;
    personEventId : number; 
    finalDiagnosis : string; 
    rawPdPercentage : number;  
    nettAssessedPdPercentage : number; 
    assessedBy : number; 
    assessmentDate : Date;
    isDeleted : boolean;
    createdBy : string;
    createdDate : Date;
    modifiedBy : string;
    modifiedDate : Date;
    disabilityAssessmentStatus : DisabilityAssessmentStatusEnum;
    claimId : number;
    claimReferenceNumber : string;
    isAuthorised : boolean;
    medicalReportFormId : number;
}