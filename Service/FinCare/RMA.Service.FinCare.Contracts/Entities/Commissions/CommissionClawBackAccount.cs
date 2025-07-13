using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionClawBackAccount : AuditDetails
    {
        public int ClawBackAccountId { get; set; }
        public int RecepientTypeId { get; set; }
        public int RecepientId { get; set; }
        public string RecepientCode { get; set; }
        public string RecepientName { get; set; }
        public decimal AccountBalance { get; set; }
        public List<CommissionClawBackAccountMovement> ClawBackAccountMovements { get; set; }
    }
}
