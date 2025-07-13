import { DisabilityAssessmentStatusEnum } from "projects/shared-models-lib/src/lib/enums/disability-assessment-status-enum";

export class ClaimDisabilityAssessment{
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
    isAuthorised : boolean;
    medicalReportFormId : number;
}