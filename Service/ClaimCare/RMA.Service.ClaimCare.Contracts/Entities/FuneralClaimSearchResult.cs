using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class FuneralClaimSearchResult
    {
        public int Id { get; set; }
        public DateTime DateRegistered { get; set; }
        public DateTime DateOfCommencement { get; set; }
        public string Channel { get; set; }
        public string TypeOfDeath { get; set; }
        public string DeseasedName { get; set; }
        public string DeseasedSurname { get; set; }
        public string Brokerage { get; set; }
        public string BrokerNumber { get; set; }
        public decimal? BenefitAmount { get; set; }
        public DateTime DateOfDeath { get; set; }
        public string Product { get; set; }
        public string CompanyName { get; set; }
        public string Broker { get; set; }
        public string Scheme { get; set; }
        public string User { get; set; }
        public string ClaimStatus { get; set; }
        public int StatusId { get; set; }
    }
}