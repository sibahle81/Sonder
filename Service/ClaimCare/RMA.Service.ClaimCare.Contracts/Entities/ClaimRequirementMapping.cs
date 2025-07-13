using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimRequirementMapping
    {
        public EventTypeEnum EventType { get; set; }
        public bool isRoadAccident { get; set; }
        public bool isTrainee { get; set; }
        public bool isAssault { get; set; }
        public bool isFatal { get; set; }

    }
}