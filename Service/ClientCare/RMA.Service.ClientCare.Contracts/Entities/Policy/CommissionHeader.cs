using RMA.Common.Entities;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CommissionHeader : AuditDetails
    {
        public string Period { get; set; }
        public DateTime? ExportDate { get; set; }
        //public List<CommissionSummary> CommissionSummaries { get; set; }
    }
}