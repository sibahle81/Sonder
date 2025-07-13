using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class CommissionHeader : AuditDetails
    {
        public int HeaderId { get; set; }
        public int PeriodId { get; set; }
        public CommissionRecepientTypeEnum RecepientTypeId { get; set; }
        public int RecepientId { get; set; }
        public string RecepientCode { get; set; }
        public string RecepientName { get; set; }
        public decimal TotalHeaderAmount { get; set; }
        public CommissionStatusEnum HeaderStatusId { get; set; }
        public CommissionActionTypeEnum? Action { get; set; }
        public string Comment { get; set; }
        public List<CommissionDetail> Details { get; set; }
        public int PeriodYear { get; set; }
        public int PeriodMonth { get; set; }
        public bool IsFitAndProper { get; set; }
        public DateTime? FitAndProperCheckDate { get; set; }
        public int? WithholdingReasonId { get; set; }
        public int? AssignedTo { get; set; }
        public List<CommissionPaymentInstruction> PaymentInstructions { get; set; }

    }
}
