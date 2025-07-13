using RMA.Service.ClientCare.Contracts.Entities.Client;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyStatistics
    {
        public string Name { get; set; }
        public int Count { get; set; }
        public List<ClientStatisticDetail> ItemsFromLastDay { get; set; }
    }
}