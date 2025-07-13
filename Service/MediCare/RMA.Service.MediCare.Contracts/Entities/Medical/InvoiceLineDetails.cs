namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class InvoiceLineDetails : InvoiceLine
    {
        public string TariffBaseUnitCostType { get; set; }
        public string TariffDescription { get; set; }
        public decimal DefaultQuantity { get; set; }
        public int TariffTypeId { get; set; }
        public int PublicationId { get; set; }
    }
}
