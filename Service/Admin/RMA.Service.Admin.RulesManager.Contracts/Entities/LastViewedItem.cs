using RMA.Service.Admin.RulesManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.RulesManager.Contracts.Entities
{
    public class LastViewedItem
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public RulesItemType ItemType { get; set; }
        public string User { get; set; }
        public DateTime Date { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool CanEdit { get; set; }
    }
}