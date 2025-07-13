import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

export class FirstDiseaseMedicalReportForm {
  medicalReportForm: MedicalReportForm;

  diagnosis : string;
  dateSymptomsStarted : Date;
  symptoms:string
  firstConsultationDate : Date;
  dateDiagnosed : Date;
  clinicalDetails :string;
  wasReferredToSpecialist :boolean;
  additionalAnalysisDone :string;
  specialistReferralDetails :string;
  preExistingConditions :string;
  diseaseProgressionDetails :string;
  othersAffected :boolean
  priorCareManagement :string;
  priorWorkManagement :string;
  isAdaptedWorkArrangementTemporary :boolean
  workOption :string;
  axis1 :string;
  axis2 :string;
  axis3 :string;
  axis4 :string;
  axis5 :string;

}
