using RMA.Common.Entities;

using System;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionPeriod : AuditDetails
    {
        public int PeriodId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Yyyy { get; set; } // YYYY
        public int Mm { get; set; } // MM
        public int? PeriodChangeReasonId { get; set; }
    }
}
