
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class PoolWorkFlowRequest
    {
        public PoolWorkFlowItemTypeEnum ItemType { get; set; }
        public int ItemId { get; set; }
    }
}