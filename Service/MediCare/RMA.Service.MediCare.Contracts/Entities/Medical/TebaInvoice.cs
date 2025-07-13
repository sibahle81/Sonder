using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TebaInvoice : Common.Entities.AuditDetails
    {
        public int TebaInvoiceId { get; set; }
        public int ClaimId { get; set; }
        public int? PersonEventId { get; set; }
        public int InvoicerId { get; set; }
        public int InvoicerTypeId { get; set; }
        public string HcpInvoiceNumber { get; set; }
        public string HcpAccountNumber { get; set; }
        public string InvoiceNumber { get; set; }
        public System.DateTime InvoiceDate { get; set; }
        public System.DateTime DateSubmitted { get; set; }
        public System.DateTime? DateReceived { get; set; }
        public System.DateTime? DateCompleted { get; set; }
        public System.DateTime? DateTravelledFrom { get; set; }
        public System.DateTime? DateTravelledTo { get; set; }
        public int? PreAuthId { get; set; }
        public InvoiceStatusEnum InvoiceStatus { get; set; }
        public decimal InvoiceAmount { get; set; }
        public decimal InvoiceVat { get; set; }
        public decimal? InvoiceTotalInclusive { get; set; }
        public decimal AuthorisedAmount { get; set; }
        public decimal AuthorisedVat { get; set; }
        public decimal? AuthorisedTotalInclusive { get; set; }
        public int PayeeId { get; set; }
        public int PayeeTypeId { get; set; }
        public string HoldingKey { get; set; }
        public bool IsPaymentDelay { get; set; }
        public bool IsPreauthorised { get; set; }
        public string Description { get; set; }
        public string CalcOperands { get; set; }
        public decimal Kilometers { get; set; }
        public decimal KilometerRate { get; set; }
        public string TebaTariffCode { get; set; }//values from TebaTariffCodeTypeEnum
        public VatCodeEnum VatCode { get; set; }
        public decimal? VatPercentage { get; set; }
        public int SwitchBatchId { get; set; }
        public string SwitchTransactionNo { get; set; }
        public int? SwitchBatchInvoiceId { get; set; }
        public string ClaimReferenceNumber { get; set; }
        public string HealthCareProviderName { get; set; }
        public string PracticeNumber { get; set; }
        public List<TebaInvoiceLine> TebaInvoiceLines { get; set; }
        public List<InvoiceUnderAssessReason> InvoiceUnderAssessReasons { get; set; }
        public List<PreAuthorisation> MedicalInvoicePreAuths { get; set; }
    }
}
