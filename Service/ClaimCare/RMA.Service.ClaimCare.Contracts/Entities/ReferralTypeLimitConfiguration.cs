namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ReferralTypeLimitConfiguration
    {
        public int ReferralTypeLimitConfigurationId { get; set; }
        public int ReferralTypeLimitGroupId { get; set; }
        public decimal AmountLimit { get; set; }
        public string PermissionName { get; set; }
        public int? DaysLimit { get; set; } 
    }
}