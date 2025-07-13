using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class PaymentResponseModel : ServiceBusMessageBase
    {
        public int PaymentId { get; set; }
        public PaymentStatusEnum PaymentStatus { get; set; }
        public PaymentTypeEnum PaymentType { get; set; }

        public string ErrorCode { get; set; }
        public string ErrorDescription { get; set; }
        public DateTime? RejectionDate { get; set; }
        public DateTime? ReconciliationDate { get; set; }
        public int? PolicyId { get; set; }
        public int? ClaimId { get; set; }
        public int? PaymentInstructionId { get; set; }
        public int? RefundHeaderId { get; set; }
    }
}
