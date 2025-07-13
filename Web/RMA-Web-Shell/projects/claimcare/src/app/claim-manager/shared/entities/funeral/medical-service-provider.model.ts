import { PractitionerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/practitioner-type-enum';

//**awaiting for conclusions around medical.healthcare table to finilize */
export class HealthCareProviderV2 {
    rolePlayerId: number;
    name: string;
    description: string;
    practiceNumber: string;
    datePracticeStarted: string | null;
    datePracticeClosed: string | null;
    providerTypeId: number;
    practitionerTypeName: string;
    isVat: boolean;
    vatRegNumber: string;
    consultingPartnerType: number | null;
    isPreferred: boolean;
    isMedInvTreatmentInfoProvided: boolean;
    isMedInvInjuryInfoProvided: boolean;
    isMineHospital: boolean;
    isNeedTreatments: boolean;
    armType: number | null;
    armCode: string;
    finSystemSynchStatusId: number;
    healthCareProviderGroupId: number;
    dispensingLicenseNo: string;
    acuteMedicalAuthNeededTypeId: number | null;
    chronicMedicalAuthNeededTypeId: number | null;
    isAllowSameDayTreatment: boolean;
    agreementEndDate: string | null;
    agreementStartDate: string | null;
    isAuthorised: boolean | null;
    agreementType: number | null;
    isExcludeAutoPay: boolean;
}
