using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumListingMember
    {
        public int Id { get; set; }
        public string MemberName { get; set; }
        public string IdNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int Age { get; set; }
        public DateTime JoinDate { get; set; }
        public string MemberType { get; set; }
        public string BenefitName { get; set; }
        public decimal? BenefitAmount { get; set; }
        public decimal? PolicyPremium { get; set; }
        public int Records { get; set; }
        public int PolicyId { get; set; }
    }
}
