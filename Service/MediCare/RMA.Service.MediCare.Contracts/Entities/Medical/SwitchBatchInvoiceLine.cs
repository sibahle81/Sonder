using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatchInvoiceLine : AuditDetails
    {
        public int SwitchBatchInvoiceLineId { get; set; }
        public int SwitchBatchInvoiceId { get; set; }
        public int? BatchSequenceNumber { get; set; }
        public string Quantity { get; set; }
        public decimal? TotalInvoiceLineCost { get; set; }
        public decimal? TotalInvoiceLineVat { get; set; }
        public decimal? TotalInvoiceLineCostInclusive { get; set; }
        public System.DateTime? ServiceDate { get; set; }
        public decimal? CreditAmount { get; set; }
        public string VatCode { get; set; }
        public string TariffCode { get; set; }
        public string OtherCode { get; set; }
        public string Description { get; set; }
        public string Icd10Code { get; set; }
        public string SwitchTransactionNumber { get; set; }
        public string SwitchInternalNumber { get; set; }
        public string FileSequenceNumber { get; set; }
        public string Modifier1 { get; set; }
        public string Modifier2 { get; set; }
        public string Modifier3 { get; set; }
        public string Modifier4 { get; set; }
        public string DosageDuration { get; set; }
        public string ServiceProviderTransactionNumber { get; set; }
        public string CptCode { get; set; }
        public int? TreatmentCodeId { get; set; }
        public List<SwitchBatchInvoiceLineUnderAssessReason> SwitchBatchInvoiceLineUnderAssessReasons { get; set; }
        public System.TimeSpan? ServiceTimeStart { get; set; }
        public System.TimeSpan? ServiceTimeEnd { get; set; }
    }
}
