import { ReportCategoryDetail } from 'projects/medicare/src/app/medical-reports-manager/models/report-category';

export class UrologicalReviewDetail extends ReportCategoryDetail
{
    dateReviewed: Date;
    levelOfInjury:  string;
    examinationBp:  string;
    examinationPulse: string;
    hasBedSores: boolean;
    bedsoresDescription: string;
    cystoscopy: string;
    urodynamics: string;
    LPPTest: string;
    complianceTest: string;
    otherTest: string;
    VCU: boolean;
    VCUTestDate: Date;
    refluxGrade: string;
    sphincterDESD: string;
    sphincterDescription: string;
    sonar: string;
    IVP: boolean;
    IVPTestDate: Date;
    FBC: string;
    UandEL: string;
    PSA: string;
    MCandS: string;
    creatinineClearance: string;
    hostilityFactor: string;
    followUpSummary: string;
    medicationsTTO: string;
    complicationsRisk: string;
    followUpDate: Date;
    reviewedBy: string;
}