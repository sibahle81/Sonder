using System;
using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ChronicMedicationForm : Common.Entities.AuditDetails
    {
        public int ChronicMedicationFormId { get; set; }
        public int ClaimId { get; set; }
        public bool? IsSignedByApplicant { get; set; }
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; } // Weight
        public string BloodPressure { get; set; } // BloodPressure (length: 6)
        public string Urine { get; set; } // Urine (length: 50)
        public string Allergies { get; set; } // Allergies (length: 50)
        public string HivStatus { get; set; } // HIVStatus (length: 50)
        public string Description { get; set; } // Description (length: 2048)
        public DateTime? DateFormFilled { get; set; } // DateFormFilled
        public DateTime? DateSubmitted { get; set; } // DateSubmitted
        public System.DateTime? DateConsulted { get; set; } // DateConsulted
        public int? MedicalServiceProviderId { get; set; } // MedicalServiceProviderId
        public byte? DeliveryMethod { get; set; } // DeliveryMethod
        public string Hobbies { get; set; } // Hobbies (length: 50)
        public int? PreAuthId { get; set; } // PreAuthId
        public string DeliveryAddress { get; set; } // DeliveryAddress (length: 1000)
        public bool? IsSignedByHcp { get; set; } // IsSignedByHCP
        public System.DateTime? DateSignedByHcp { get; set; } // DateSignedByHCP

        public List<ChronicMedicationHistory> ChronicMedicalHistories { get; set; }

        public List<ChronicScriptMedicine> ChronicScriptMedicines { get; set; }
    }
}
