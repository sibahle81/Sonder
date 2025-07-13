using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class BrokerageRepresentativeRequest
    {
        public string FspNumber { get; set; }
        public List<string> RepresentativeIdNumbers { get; set; }
        public BrokerageTypeEnum BrokerageType { get; set; }
    }
}
