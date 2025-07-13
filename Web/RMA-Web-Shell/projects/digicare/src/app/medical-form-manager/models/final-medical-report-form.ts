import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

export class FinalMedicalReportForm {
  finalMedicalReportFormId: number;
  medicalReportForm: MedicalReportForm;
  mechanismOfInjury: string;
  injuryOrDiseaseDescription: string;
  additionalContributoryCauses: string;
  impairmentFindings: string;
  isStabilised: boolean;
  dateReturnToWork: Date;
  dateStabilised: Date;
  pevStabilisedDate: Date;
}
