using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class CloseRenewalPeriodServiceBusMessage : ServiceBusMessageBase
    {
        public int PolicyId { get; set; }
        public string ProductOptionName { get; set; }
        public string FinPayeNumber { get; set; }
        public IndustryClassEnum IndustryClass { get; set; }
    }
}