using RMA.Service.Admin.BusinessProcessManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class LastViewedItem
    {
        public int Id { get; set; }

        public int ItemId { get; set; }

        public ItemType ItemType { get; set; }

        public string User { get; set; }

        public DateTime Date { get; set; }
    }
}