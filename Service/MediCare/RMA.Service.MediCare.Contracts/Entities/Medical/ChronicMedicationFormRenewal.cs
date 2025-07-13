using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ChronicMedicationFormRenewal : Common.Entities.AuditDetails
    {
        public int ChronicMedicationFormRenewalId { get; set; } // ChronicMedicationFormRenewalId (Primary key)
        public int ClaimId { get; set; } // ClaimId
        public int MedicalServiceProviderId { get; set; } // MedicalServiceProviderId
        public string Description { get; set; } // Description (length: 2048)
        public bool? IsNeurogenicPain { get; set; } // IsNeurogenicPain
        public bool? IsMechanicalPain { get; set; } // IsMechanicalPain
        public bool? IsDegenerativePain { get; set; } // IsDegenerativePain
        public bool? IsPsychogenicPain { get; set; } // IsPsychogenicPain
        public bool? IsMuslcespasmPain { get; set; } // IsMuslcespasmPain
        public bool? IsFibromialgiaPain { get; set; } // IsFibromialgiaPain
        public byte PainEvaluation { get; set; } // PainEvaluation
        public byte ContinuousDuration { get; set; } // ContinuousDuration
        public bool? IsLifeStyleChanges { get; set; } // IsLifeStyleChanges
        public bool? IsPhysiotherapy { get; set; } // IsPhysiotherapy
        public bool? IsNerveBlock { get; set; } // IsNerveBlock
        public bool? IsArthroplasty { get; set; } // IsArthroplasty
        public bool? IsPsychotherapy { get; set; } // IsPsychotherapy
        public bool? IsAccupuncture { get; set; } // IsAccupuncture
        public System.DateTime? DateSubmitted { get; set; } // DateSubmitted
        public System.DateTime? DateConsulted { get; set; } // DateConsulted
        public string Hobbies { get; set; } // Hobbies (length: 50)
        public byte? DeliveryMethod { get; set; } // DeliveryMethod
        public int? PreAuthId { get; set; } // PreAuthId
        public string DeliveryAddress { get; set; } // DeliveryAddress (length: 1000)
        public bool? IsSignedByHcp { get; set; } // IsSignedByHCP
        public System.DateTime? DateSignedByHcp { get; set; } // DateSignedByHCP
        public int? AuthorisedChronicAuthorisationId { get; set; } // AuthorisedChronicAuthorisationId

        public List<ChronicScriptMedicineRenewal> ChronicScriptMedicineRenewals { get; set; }
    }
}
