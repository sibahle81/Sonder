import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PersonEventNoiseDetailModel extends BaseClass {
    PersonEventId: number;
    NoiseLevel: number;
    ExposurePeriodShifts: number;
    ExposurePeriodYears: number;
    LastNoiseExposureDate: Date;
    IsStillWorkingInNoise: boolean;
    FirstAudiogramDeate: Date;
    ShiftDatePriorToTest: Date;
    IsNoNoisePriorToTest: boolean;
    IsPreviousCompensationForDeafness: boolean;
}
