namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class BankBalance
    {
        public int Id { get; set; }
        public string AccountNumber { get; set; }
        public decimal Balance { get; set; }
    }
}
