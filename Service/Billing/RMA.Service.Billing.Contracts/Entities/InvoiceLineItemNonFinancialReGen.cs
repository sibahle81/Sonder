namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceLineItemNonFinancialReGen
    {
        public int InvoiceLineItemsId { get; set; }
        public string InsurableItem { get; set; }
        public int? NoOfEmployees { get; set; }
    }
}
