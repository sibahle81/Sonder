import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export interface ClinicalUpdateTreatmentPlan extends BaseClass {
    clinicalUpdateTreatmentPlanId: number;
    clinicalUpdateId: number;
    treatmentPlanId: number;
    treatmentPlanDescription: string;
}