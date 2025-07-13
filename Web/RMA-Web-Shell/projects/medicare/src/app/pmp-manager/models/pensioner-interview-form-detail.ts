import { PensionerInterviewFormDetail } from "./pensioner-briefing-interview-form-detail";

export class PensionerInterviewForm {
    pensionerInterviewFormId: number;
    pensionerId: number;
    interviewDate: string;
    relocation: number | null;
    chronicMedicine: string;
    furtherTreatment: string;
    transporting: string;
    branchId: number | null;
    tebaLocationId: number;
    infoBrochure: string;
    col: string;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: string;
    modifiedBy: string;
    modifiedDate: string;
    isInjury: boolean | null;
    occupationaInjuryName: string;
    isDisease: boolean | null;
    occupationalDiseaseName: string;
    isAmputee: boolean | null;
    isWheelchairIssued: boolean | null;
    wheelchairIssued: string | null;
    makeModel: string;
    applianceReviewDate: string | null;
    limbAmputated: string;
    levelOfAmputation: string;
    isCaa: boolean | null;
    isInstitutionalised: boolean | null;
    nameOfInstitution: string;
    contactNoOfInstitution: string;
    pensionerInterviewFormDetails: PensionerInterviewFormDetail[];
}
