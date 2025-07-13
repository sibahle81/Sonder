using System;

namespace RMA.Service.Billing.Database.Entities
{
    public partial class finance_BankStatementEntry
    {
        public decimal Amount
        {
            get
            {
                if (NettAmount == null) return 0.00M;
                var amount = (decimal)((long)NettAmount / 100.0);
                amount = DebitCredit == "+" ? Math.Abs(amount) : -Math.Abs(amount);
                return amount;
            }
        }
    }
}
