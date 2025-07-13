using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class Invoice : Common.Entities.AuditDetails
    {
        public int InvoiceId { get; set; }
        public int? ClaimId { get; set; }
        public int? PersonEventId { get; set; }
        public int HealthCareProviderId { get; set; }
        public string HcpInvoiceNumber { get; set; }
        public string HcpAccountNumber { get; set; }
        public string InvoiceNumber { get; set; }
        public System.DateTime InvoiceDate { get; set; }
        public System.DateTime? DateSubmitted { get; set; }
        public System.DateTime? DateReceived { get; set; }
        public System.DateTime? DateAdmitted { get; set; }
        public System.DateTime? DateDischarged { get; set; }
        public InvoiceStatusEnum InvoiceStatus { get; set; }
        public decimal InvoiceAmount { get; set; }
        public decimal InvoiceVat { get; set; }
        public decimal? InvoiceTotalInclusive { get; set; }
        public decimal AuthorisedAmount { get; set; }
        public decimal AuthorisedVat { get; set; }
        public decimal? AuthorisedTotalInclusive { get; set; }
        public int PayeeId { get; set; }
        public int PayeeTypeId { get; set; }
        public string UnderAssessedComments { get; set; }
        public int? SwitchBatchInvoiceId { get; set; }
        public string HoldingKey { get; set; }
        public bool IsPaymentDelay { get; set; }
        public bool IsPreauthorised { get; set; }
        public string PreAuthXml { get; set; }
        public string Comments { get; set; }
        public bool IsMedicalReportExist { get; set; }
        public int? SwitchBatchId { get; set; }
        public List<InvoiceLine> InvoiceLines { get; set; }
        public List<InvoiceUnderAssessReason> InvoiceUnderAssessReasons { get; set; }
        public List<MedicalInvoiceReport> MedicalInvoiceReports { get; set; }
        public List<PreAuthorisation> MedicalInvoicePreAuths { get; set; }
    }
}
