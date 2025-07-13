import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export interface TreatmentProtocol extends BaseClass {
    treatmentProtocolId: number;
    levelOfCareId: number;
    name: string;
    description: string;
}