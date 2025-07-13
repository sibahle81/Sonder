using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ProcessQlinkTransactionRequest : ServiceBusMessageBase
    {
        public List<string> PolicyNumbers { get; set; }
        public QLinkTransactionTypeEnum QLinkTransactionType { get; set; }
    }
}
