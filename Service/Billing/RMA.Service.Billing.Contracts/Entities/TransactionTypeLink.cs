namespace RMA.Service.Billing.Contracts.Entities
{
    public class TransactionTypeLink
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsDebit { get; set; }
        public virtual System.Collections.Generic.ICollection<Transaction> Transactions { get; set; }

    }
}
