namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventNoiseDetail
    {
        public int PersonEventId { get; set; } // PersonEventId (Primary key)
        public decimal NoiseLevel { get; set; } // NoiseLevel
        public decimal ExposurePeriodShifts { get; set; } // ExposurePeriodShifts
        public decimal ExposurePeriodYears { get; set; } // ExposurePeriodYears
        public System.DateTime LastNoiseExposureDate { get; set; } // LastNoiseExposureDate
        public bool IsStillWorkingInNoise { get; set; } // IsStillWorkingInNoise
        public System.DateTime? FirstAudiogramDeate { get; set; } // FirstAudiogramDeate
        public System.DateTime ShiftDatePriorToTest { get; set; } // ShiftDatePriorToTest
        public bool IsNoNoisePriorToTest { get; set; } // IsNoNoisePriorToTest
        public bool IsPreviousCompensationForDeafness { get; set; } // IsPreviousCompensationForDeafness
    }
}
