using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class Statistics
    {
        public string Name { get; set; }
        public int Count { get; set; }
        public List<StatisticDetail> ItemsFromLastDay { get; set; }
    }
}