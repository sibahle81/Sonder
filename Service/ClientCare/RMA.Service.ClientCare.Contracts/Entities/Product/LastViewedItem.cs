using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class LastViewedItem
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public string User { get; set; }
        public DateTime Date { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool CanEdit { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public bool IsActive { get; set; }
        public string StatusText { get; set; }
    }
}