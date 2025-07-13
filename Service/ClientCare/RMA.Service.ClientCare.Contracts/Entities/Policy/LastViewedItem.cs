using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class LastViewedItem
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public string User { get; set; }
        public DateTime Date { get; set; }
    }
}