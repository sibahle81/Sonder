import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

export class FinalDiseaseMedicalReportForm {
  medicalReportForm: MedicalReportForm;
  dateReturnToWork: Date;
  stabilisedDate: Date;
  occupationChangeDetails: string;
  permanentFunctionalLoss: string;
  conditionStabilisedDetails: string;
}
