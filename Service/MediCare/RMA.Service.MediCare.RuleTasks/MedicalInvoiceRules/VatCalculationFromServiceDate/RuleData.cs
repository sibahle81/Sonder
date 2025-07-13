using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.MediCare.RuleTasks.MedicalInvoiceRules.VatCalculationFromServiceDate
{
    public class RuleData
    {
        public decimal VatAmount1 { get; set; } // VatAmount1 for first line (all line items must belong to the same VAT period, as such then use the first one)
        public decimal VatAmount2 { get; set; } // VatAmount2 for each line
        public VatCodeEnum VatCode { get; set; } // VatCode
    }
}
