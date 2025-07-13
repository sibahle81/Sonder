using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ConsolidatedFuneralSummary
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string ClientName { get; set; }
        public string ClientIdNumber { get; set; }
        public string ClientPassportNumber { get; set; }
        public string ClientEmail { get; set; }
        public string ClientCellNo { get; set; }
        public string BrokerEmail { get; set; }
        public CommunicationTypeEnum PreferredCommunicationType { get; set; }
        public PaymentMethodEnum PaymentMethod { get; set; }
        public bool NewPolicy { get; set; }
    }
}
