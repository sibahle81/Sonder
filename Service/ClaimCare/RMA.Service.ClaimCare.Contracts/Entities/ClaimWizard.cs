using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimWizard : AuditDetails
    {
        public int ClaimId { get; set; } // ClaimId
        public string WizardUrl { get; set; } // WizardURL (length: 50)
        public int UserId { get; set; } // UserId
    }
}
