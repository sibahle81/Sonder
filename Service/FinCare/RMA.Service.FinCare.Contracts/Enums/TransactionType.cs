using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Enums
{
    public static class TransactionTypes
    {
        public static List<TransactionTypeEnum> Credits
        {
            get
            {
                var list = new List<TransactionTypeEnum>
                {
                     TransactionTypeEnum.InvoiceReversal,
                     TransactionTypeEnum.Payment,
                     TransactionTypeEnum.CreditNote
                };
                return list;
            }
        }

        public static List<TransactionTypeEnum> Debits
        {
            get
            {
                var list = new List<TransactionTypeEnum>
                {
                     TransactionTypeEnum.Invoice,
                     TransactionTypeEnum.DebitNote,
                     TransactionTypeEnum.PaymentReversal,
                     TransactionTypeEnum.Interest,
                     TransactionTypeEnum.PaymentPlan,
                     TransactionTypeEnum.InterDebtorTransfer,
                     TransactionTypeEnum.Refund,
                };
                return list;
            }
        }
    }
}