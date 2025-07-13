import { AudioGramItem } from "./audio-gram-item"
import { ClaimHearingAssessmentType } from "./claim-hearing-assessment-type"

export class ClaimHearingAssessment {
    hearingAssessmentId: number;
    rolePlayerId: number;
    assessmentDate: Date;
    assessedByUserId: number;
    assessedByName: string;
    description: string;
    hearingAssessmentTypeId: number;
    personEventId: number;
    percentageHl: number;
    baselinePhl: number;
    isActive: boolean;
    calcOperands: string;
    baselineAudiogram: number;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    captureAudiogram: boolean;
    audioGramItems: AudioGramItem[];

    hearingAssessmentType: ClaimHearingAssessmentType;
}
