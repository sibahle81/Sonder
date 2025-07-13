namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatchInvoicesDuplicatesOutput
    {
        public string BatchTariffCodeServiceDate { get; set; }
        public string BatchTotalInvoiceLineCostInclServiceDate { get; set; }
        public string BatchTariffCodeTotalInvoiceLineCostInclServiceDate { get; set; }

        public string InvoiceTariffCodeServiceDate { get; set; }
        public string InvoiceTotalInvoiceLineCostInclServiceDate { get; set; }
        public string InvoiceTariffCodeTotalInvoiceLineCostInclServiceDate { get; set; }
    }
}
