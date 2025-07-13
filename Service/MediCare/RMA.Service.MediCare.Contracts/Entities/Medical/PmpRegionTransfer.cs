using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PmpRegionTransfer
    {
        public int PmpRegionTransferId { get; set; } // PMPRegionTransferId (Primary key)
        public int ClaimId { get; set; } // ClaimId
        public int? HealthCareProviderId { get; set; } // HealthCareProviderId
        public bool? IsUds { get; set; } // IsUDS
        public bool? IsSpousalTraining { get; set; } // IsSpousalTraining
        public System.DateTime? DateOfTransfer { get; set; } // DateOfTransfer
        public System.DateTime ExpDateOfArrival { get; set; } // ExpDateOfArrival
        public System.DateTime? DateOfReferral { get; set; } // DateOfReferral
        public System.DateTime? PassportVisaRenewalDate { get; set; } // PassportVisaRenewalDate
        public System.DateTime? ConfDateOfArrival { get; set; } // ConfDateOfArrival
        public int ReferringMcaId { get; set; } // ReferringMCAId
        public int ReceivingMcaId { get; set; } // ReceivingMCAId
        public int ReferringPaId { get; set; } // ReferringPAId
        public int ReceivingPaId { get; set; } // ReceivingPAId
        public int ReferringPmpRegionId { get; set; } // ReferringPMPRegionId
        public int ReceivingPmpRegionId { get; set; } // ReceivingPMPRegionId
        public string Comments { get; set; } // Comments (length: 2048)
        public string ReasonForReferral { get; set; } // ReasonForReferral (length: 2048)
        public string TreatmentReceived { get; set; } // TreatmentReceived (length: 2048)
        public string Daigonsis { get; set; } // Daigonsis (length: 2048)
        public string MedicationSundriesIssued { get; set; } // MedicationSundriesIssued (length: 2048)
        public string IssuedDate { get; set; } // IssuedDate (length: 2048)
        public short? IssuedMonth { get; set; } // IssuedMonth
        public bool IsAcute { get; set; } // IsAcute
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public virtual HealthCareProvider HealthCareProvider { get; set; } // FK_PMPRegionTransfer_HealthCareProvider
    }
}
