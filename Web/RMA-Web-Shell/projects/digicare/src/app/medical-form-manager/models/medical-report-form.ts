export class MedicalReportForm {
  medicalReportFormId: number;
  medicalReportSystemSource: number;
  consultationDate: Date;
  icd10Codes: string;
  icd10CodesJson: string;
  healthcareProviderName: string;
  healthcareProviderPracticeNumber: string;
  healthcareProviderId: number;
  workItemId: number;
  compcareMedicalReportId: number;
  reportCategoryId: number;
  reportCategoryData: string;
  reportTypeId: number;
  reportStatus: string;
  reportStatusDetail: string;
  reportStatusId: number;
  reportDetail: string;
  reportDate: Date;
  unfitStartDate: Date;
  unfitEndDate: Date;
  nextReviewDate: Date;
  documentStatusId: number;
  documentId: number;
  isDeleted:boolean;
  medicalReportRejectionReasonId : number
  medicalReportRejectionReasonDescription : string

  // Claim details
  claimReferenceNumber: string;
  eventCategoryId: number;
  personEventId: number;
  claimId: number;
  eventDate: Date;
  name: string;
  surname: string;
  gender: string;
  dateOfBirth: Date;
  contactNumber: string;
  industryNumber: string;
  employerName: string;
  claimantOccupation: string;
  isDeclarationAccepted: boolean;
  isICD10CodeMatch: boolean;

  // auditInfo
  createdBy: string;
  modifiedBy: string;
  tenantId: number;
  createdDate: Date;
  ModifiedDate: Date;

  isUnfitForWork(): boolean {
    return (this.unfitStartDate) && this.unfitStartDate > new Date();
  }
}
