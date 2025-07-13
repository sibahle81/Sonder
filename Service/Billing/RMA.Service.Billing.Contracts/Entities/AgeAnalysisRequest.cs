using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    // Do not add enums, e.g. clientTypeId, because there are additional values like 0 = All Client Types
    public class AgeAnalysisRequest
    {
        public int ClientTypeId { get; set; }
        public int AgeTypeId { get; set; }
        public int DebtorStatusId { get; set; }
        public int AssignedStatusId { get; set; }
        public int BalanceTypeId { get; set; }
        public int IndustryId { get; set; }
        public DateTime EndDate { get; set; }
        public bool IncludeInterest { get; set; }
        public bool IncludeNotes { get; set; }
        public int Counter { get; set; }
        public int ProductId { get; set; }
    }
}
