
export class HealthCareProviderModel {
  rolePlayerId: number;
  name: string;
  description: string;
  practiceNumber: string;
  datePracticeStarted: string | null;
  datePracticeClosed: string | null;
  providerTypeId: number;
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
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  hash: string;
  isExcludeAutoPay: boolean;
  isJvPartner: boolean;
}