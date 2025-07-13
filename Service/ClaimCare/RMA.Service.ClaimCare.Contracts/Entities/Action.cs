using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Action
    {
        public string ItemType { get; set; }
        public int ItemId { get; set; }
        public ClaimStatusEnum Status { get; set; }
        public int? UserId { get; set; }
        public System.DateTime? ActionDate { get; set; }
        public ClaimCancellationReasonEnum? CancellationReason { get; set; }
        public ClaimDeclineReasonEnum? ClaimDeclineReason { get; set; }
        //ENUM => ID Conversions
        public int StatusId
        {
            get => (int)Status;
            set => Status = (ClaimStatusEnum)value;
        }
    }

    public class PersonEventAction
    {
        public string ItemType { get; set; }
        public int ItemId { get; set; }
        public int? UserId { get; set; }
        public System.DateTime? ActionDate { get; set; }
        public bool? FraudulentCase { get; set; }
        public ClaimCancellationReasonEnum? CancellationReason { get; set; }
        public PersonEventStatusEnum PersonEventStatus { get; set; }
        public int PersonEventStatusId
        {
            get => (int)PersonEventStatus;
            set => PersonEventStatus = (PersonEventStatusEnum)value;
        }
    }

    public class ClaimEmailAction
    {
        public int ClaimId { get; set; }
        public int PersonEventId { get; set; }
        public string ActionType { get; set; }
        public bool? FraudulentCase { get; set; }

    }
}
