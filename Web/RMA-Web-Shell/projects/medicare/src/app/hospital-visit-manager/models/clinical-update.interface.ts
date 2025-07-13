import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { PreAuthIcd10Code } from 'projects/medicare/src/app/medi-manager/models/preAuthIcd10Code';
import { ClinicalUpdateTreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-protocol.interface';
import { ClinicalUpdateTreatmentPlan } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-treatment-plan.interface';
import { PreAuthTreatmentBasket } from 'projects/medicare/src/app/preauth-manager/models/preauth-treatment-basket';
import { ClinicalUpdateStatus } from 'projects/medicare/src/app/medi-manager/enums/hospital-visit-status-enum';

export interface ClinicalUpdate  {
    clinicalUpdateId?: number;
    preAuthId?: number;
    preauthNumber?: string;
    treatingDocName?: string;
    diagnosis?: string;
    medication?: string;
    comments?: string;
    visitCompletionDate?: string;
    interimAccountBalance?: number;
    dischargeDate?: string;
    subsequentCare?: string;
    updateSequenceNo?: number;
    clinicalUpdateTreatmentPlans?: ClinicalUpdateTreatmentPlan[];
    clinicalUpdateTreatmentProtocols?: ClinicalUpdateTreatmentProtocol[];
    reviewComment?: string;
    preAuthorisationBreakdowns?: PreAuthorisationBreakdown[];
    preAuthIcd10Codes?: PreAuthIcd10Code[];
    preAuthTreatmentBaskets: PreAuthTreatmentBasket[];
    reviewDate?: Date;
    clinicalUpdateStatus?: ClinicalUpdateStatus;
}