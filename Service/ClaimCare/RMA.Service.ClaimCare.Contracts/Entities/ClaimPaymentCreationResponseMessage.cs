using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimPaymentCreationResponseMessage : ServiceBusMessageBase
    {
        public int PaymentId { get; set; }
        public int ClaimId { get; set; } // ClaimId

        public int BeneficiaryId { get; set; } // BeneficiaryId
    }
}
