using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class LastViewedItem
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public CampaignItemTypeEnum ItemType { get; set; }
        public string User { get; set; }
        public DateTime Date { get; set; }
    }
}