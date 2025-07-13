using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class ClientStatistics
    {
        public string Name { get; set; }
        public int Count { get; set; }
        public List<ClientStatisticDetail> ItemsFromLastDay { get; set; }
    }
}