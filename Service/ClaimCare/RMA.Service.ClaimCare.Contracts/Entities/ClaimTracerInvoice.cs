using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimTracerInvoice : AuditDetails
    {
        public int TracerInvoiceId { get; set; }
        public int ClaimId { get; set; }
        public int RolePlayerId { get; set; }
        public decimal? TracingFee { get; set; }
        public int PaymentStatus { get; set; }
        public string Reason { get; set; }
        public System.DateTime? PayDate { get; set; }
        public ClaimInvoiceTypeEnum ClaimInvoiceType { get; set; }
        public System.DateTime? InvoiceDate { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public System.DateTime CapturedDate { get; set; }
        public int? ProductId { get; set; }
        public string Product { get; set; }
        public Beneficiary BeneficiaryDetail { get; set; }
        public string MessageText { get; set; }
        public int? BankAccountId { get; set; }
        public string TracerEmail { get; set; }
        public ClaimBankAccountVerification ClaimBankAccountVerification { get; set; }
    }
}
