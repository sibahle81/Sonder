import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

export class FirstMedicalReportForm {
    firstMedicalReportFormId: number;
    medicalReportForm: MedicalReportForm;
    clinicalDescription: string;
    mechanismOfInjury: string;
    isInjuryMechanismConsistent: boolean;
    isPreExistingConditions: boolean;
    preExistingConditions: string;
    firstDayOff: Date;
    lastDayOff: Date;
    estimatedDaysOff: number;
    firstConsultationDate: Date;
}
