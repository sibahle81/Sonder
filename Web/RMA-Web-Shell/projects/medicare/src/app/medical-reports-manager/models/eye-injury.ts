import { ReportCategoryDetail } from 'projects/medicare/src/app/medical-reports-manager/models/report-category';

export class EyeInjuryReportDetail extends ReportCategoryDetail
{
    isUseOfGlassesNecessary: boolean;
    reasonGlassesNotPrescribed: string;
    wereAnyOperationsPerformed: boolean;
    fitForNormalWorkSince: Date;
    dateCanResumeNormalWork: Date;
    lossOfFieldOfVision: boolean;
    percentageLossFOVRightEye: number;
    percentageLossFOVLeftEye: number;
    lossOfMotility: boolean;
}