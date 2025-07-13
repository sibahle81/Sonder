import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';

export class MedicalReportFormWizardDetail {
    medicalReportFormWizardDetailId: number;
    workItemId: number;
    medicalReportFormId: number | null;
    medicalFormReportType: MedicalFormReportTypeEnum | null;
    wizardId: number | null;
    documentId: number | null;
    personEventId: number;
    createdBy: string;
    createdDate: Date | string;
    modifiedBy: string;
    modifiedDate: Date | string;
}
