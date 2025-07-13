
using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class StmOverview
    {
        public int EventTypeId { get; set; }
        public int PersonEventId { get; set; }
        public int ClaimTypeId { get; set; }
        public int InsuredLifeId { get; set; }
        public int PersonEventBucketClassId { get; set; }
        public int InsuranceTypeId { get; set; }
        public int SuspiciousTransactionStatusId { get; set; }
        public string SuspiciousTransactionName { get; set; }
        public bool IsStraightThroughProcess { get; set; }
        public string Name { get; set; }
        public int ClaimId { get; set; }
        public int? PolicyId { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool Filter { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}