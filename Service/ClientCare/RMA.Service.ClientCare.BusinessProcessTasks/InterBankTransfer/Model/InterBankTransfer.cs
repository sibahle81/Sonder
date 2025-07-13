namespace RMA.Service.ClientCare.BusinessProcessTasks.InterBankTransfer.Model
{
    public class InterBankTransfer
    {
        public int BankImportId { get; set; }
        public string SourceBank { get; set; }
        public string Description { get; set; }
        public string Date { get; set; }
        public string BankAccount { get; set; }
        public string TargetBank { get; set; }
        public string TransactionReference { get; set; }
        public decimal OriginalAmountPaid { get; set; }
        public decimal TransferAmount { get; set; }
    }
}
