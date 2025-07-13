using RMA.Common.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionAuditTrailModel : AuditDetails
    {
        public List<CommissionDetail> Details { get; set; }
        public List<CommissionPaymentInstruction> PaymentInstructions { get; set; }
        public CommissionPeriod Period { get; set; }
        public int HeaderId { get; set; }
        public int PeriodId { get; set; }
        public int RecepientTypeId { get; set; }
        public int RecepientId { get; set; }
        public int HeaderStatusId { get; set; }
        public string RecepientCode { get; set; }
        public string RecepientName { get; set; }
        public bool IsFitAndProper { get; set; }
        public DateTime FitAndProperCheckDate { get; set; }
        public decimal TotalHeaderAmount { get; set; }
        public List<string> Reasons { get; set; }
        public string Comment { get; set; }
        public int? WithholdingReasonId { get; set; }
    }
}

