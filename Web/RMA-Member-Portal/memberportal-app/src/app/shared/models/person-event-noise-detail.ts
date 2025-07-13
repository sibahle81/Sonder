export class PersonEventNoiseDetail {
    personEventId: number;
  
    noiseLevel: number;
    exposurePeriodShifts: number;
    exposurePeriodYears: number;
    lastNoiseExposureDate: Date;
    isStillWorkingInNoise: boolean;
    firstAudiogramDeate: Date;
    shiftDatePriorToTest: Date;
    isNoNoisePriorToTest: boolean;
    isPreviousCompensationForDeafness: boolean;
}