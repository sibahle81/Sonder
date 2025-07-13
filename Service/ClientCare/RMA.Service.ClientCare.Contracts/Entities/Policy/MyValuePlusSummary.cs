using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class MyValuePlusSummary
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public string ClientName { get; set; }
        public string ClientEmail { get; set; }
        public string ClientCellNo { get; set; }
        public string BrokerEmail { get; set; }
        public string IdNumberPassportNumber { get; set; }
        public CommunicationTypeEnum PreferredCommunicationType { get; set; }
        public PaymentMethodEnum PaymentMethod { get; set; }
        public bool NewPolicy { get; set; }
        public string IdNumber { get; set; }
        public string PasswordNumber { get; set; }
    }
}
