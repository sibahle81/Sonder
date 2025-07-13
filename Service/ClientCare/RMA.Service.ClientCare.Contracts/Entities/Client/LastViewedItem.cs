using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class LastViewedItem
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public ClientItemTypeEnum ItemType { get; set; }
        public string User { get; set; }
        public DateTime Date { get; set; }
        public string ColumnOneName { get; set; }
        public string ColumnOneValue { get; set; }
        //ENUM => ID Conversions
        public int ItemTypeId
        {
            get => (int)ItemType;
            set => ItemType = (ClientItemTypeEnum)value;
        }
    }
}