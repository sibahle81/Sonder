using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Integrations.Contracts.Entities.STP
{
    public class STPIntegrationBody
    {
        public int PersonEventId { get; set; }
        public int SuspiciousTransactionStatusID { get; set; }
        public bool IDVOPDValidated { get; set; }
        public bool ReSubmitVOPD { get; set; }
        public int STPExitReasonId { get; set; }
        public string STPExitReason { get; set; }
    }
}
