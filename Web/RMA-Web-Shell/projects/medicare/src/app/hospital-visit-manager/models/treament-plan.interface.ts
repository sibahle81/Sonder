import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export interface TreatmentPlan extends BaseClass {
    treatmentPlanId: number;
    name: string;
    description: string;
}