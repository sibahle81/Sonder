using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ImportInsuredLivesSummary
    {
        public int NewUsers { get; set; }
        public int UpdatedUsers { get; set; }
        public int DeletedUsers { get; set; }
        public int TotalUsers { get; set; }
        public double TotalNew { get; set; }
        public double TotalUpdate { get; set; }
        public double TotalDelete { get; set; }
        public double Total { get; set; }
        public int RecordCount { get; set; }
        [Obsolete("For scheme onboarding there could be more than one policy id.")]
        public int ExistingPolicyId { get; set; }
    }
}
