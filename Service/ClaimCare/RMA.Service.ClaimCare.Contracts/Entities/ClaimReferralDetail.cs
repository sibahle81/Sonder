namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimReferralDetail
    {
        public int ReferralDetailId { get; set; }
        public int ClaimId { get; set; }
        public int OwnerId { get; set; }
        public int ReferralQueryTypeId { get; set; }
        public string ReferralQuery { get; set; }
        public string QueryFeedBack { get; set; }
        public System.DateTime? FeedbackDate { get; set; }
        public System.DateTime ReceivedDate { get; set; }
        public int? ReferralRatingId { get; set; }
        public int ReferrerUser { get; set; }
        public int? WorkFlowNotificationId { get; set; }
        public byte ReferralStatusId { get; set; }
        public bool IsActive { get; set; }
        public int? ContactCenterNotificationId { get; set; }
        public int? ResolutionTypeId { get; set; }
        public string ContextualData { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string ReferredToUserName { get; set; }

    }
}
