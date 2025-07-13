namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class PaymentErrorCode
    {
        public string Key { get; set; } // Key (Primary key) (length: 10)
        public string Description { get; set; } // Description (length: 150)
    }
}