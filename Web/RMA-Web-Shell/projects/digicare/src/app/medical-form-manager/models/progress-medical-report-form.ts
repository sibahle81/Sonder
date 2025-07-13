import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form'

export class ProgressMedicalReportForm {
  progressMedicalReportFormId: number;
  medicalReportForm: MedicalReportForm;
  notStabilisedReason: string;
  treatmentDetails: string;
  specialistReferralsHistory: string;
  radiologyFindings: string;
  operationsProcedures: string;
  physiotherapyTreatmentDetails: string;
  isStabilisedChecked: boolean;
  isTreatmentChecked: boolean;
  isSpecialistReferralsHistoryChecked: boolean;
  isRadiologyFindingsChecked: boolean;
  isOperationsProceduresChecked: boolean;
  isPhysiotherapyTreatmentDetailsChecked: boolean;
  dateStabilised: Date;  
}
