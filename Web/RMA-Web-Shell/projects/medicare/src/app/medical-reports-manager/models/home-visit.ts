import { ReportCategoryDetail } from 'projects/medicare/src/app/medical-reports-manager/models/report-category';

export class HomeVisitReportDetail extends ReportCategoryDetail
{
    pain: boolean;
    painDescription: string;
    skinBlisterOrSore: boolean;
    blisterSize: string;
    skinColour: string;
    otherSymptoms: string;
    heightInMeters: number;
    weightInKilograms: number;
    bodyMassIndex: number;
    waistInCentimeters: number;
    pulseInBeatsPerMinute: number;
    bloodPressureInmmHg: number;
    hasPressureSores: boolean;
    elbowsSkin: string;
    kneesSkin: string;
    backSkin: string;
    sacralSkin: string;
    otherPressureSore: string;
    otherPhysicalFeatures: string;
    respirationInBreathsPerMinute: number;
    cynanosis: boolean;
    cynanosisDescription: string;
    fingerClubbing: boolean;
    fingerClubbingDescription: string;
    chestAuscultation: boolean;
    chestAuscultationDescription: string;
    palpableMassesOrHernia: boolean;
    abdomenScars: boolean;
    abdomenScarsWhere: string;
    abdomenTone: string;
    abdomenTenderness: boolean;
    abdomenTendernessDescription: string;
    genitalsScrotumNormal: boolean;
    genitalsScrotumNormalDescription: string;
    genitalsScrotumHydrocele: boolean;
    genitalsScrotumHydroceleDescription: string;
    genitalsPhimosis: boolean;
    genitalsPhimosisDescription: string;
    genitalsOtherAbnomalities: string;
    urinaryDipstix: string;
    urineColour: string;
    urineOdour: string;
    homeVisitGeneralComment: string;
    homeVisitActionPlan: string;
    homeVisitActionTaken: string;
    reviewedBy: string;
}