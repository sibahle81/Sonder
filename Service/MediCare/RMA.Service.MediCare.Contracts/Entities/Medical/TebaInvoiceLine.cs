using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class TebaInvoiceLine : Common.Entities.AuditDetails
    {
        public int TebaInvoiceLineId { get; set; }
        public int TebaInvoiceId { get; set; }
        public System.DateTime ServiceDate { get; set; }
        public decimal? RequestedQuantity { get; set; }
        public decimal AuthorisedQuantity { get; set; }
        public decimal RequestedAmount { get; set; }
        public decimal RequestedVat { get; set; }
        public decimal? RequestedAmountInclusive { get; set; }
        public decimal? AuthorisedAmount { get; set; }
        public decimal? AuthorisedVat { get; set; }
        public decimal? AuthorisedAmountInclusive { get; set; }
        public int TariffId { get; set; }
        public decimal TotalTariffAmount { get; set; }
        public decimal TotalTariffVat { get; set; }
        public decimal? TotalTariffAmountInclusive { get; set; }
        public decimal? TariffAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public VatCodeEnum VatCode { get; set; }
        public decimal? VatPercentage { get; set; }
        public int TreatmentCodeId { get; set; }
        public int MedicalItemId { get; set; }
        public string HcpTariffCode { get; set; }
        public int? TariffBaseUnitCostTypeId { get; set; }
        public string Description { get; set; }
        public int? SummaryInvoiceLineId { get; set; }
        public bool IsPerDiemCharge { get; set; }
        public bool IsDuplicate { get; set; }
        public int DuplicateTebaInvoiceLineId { get; set; }
        public string CalculateOperands { get; set; }
        public List<InvoiceLineUnderAssessReason> InvoiceLineUnderAssessReasons { get; set; }
    }
}
