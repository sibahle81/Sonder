using RMA.Common.Entities;

namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class FacsTransactionResult : AuditDetails
    {
        public int PaymentId { get; set; } // PaymentId
        public string TransactionType { get; set; } // TransactionType (length: 5)
        public string DocumentType { get; set; } // DocumentType (length: 2)
        public string Reference1 { get; set; } // Reference1 (length: 2)
        public string Reference2 { get; set; } // Reference2 (length: 20)
        public string Amount { get; set; } // Amount
        public string ActionDate { get; set; } // ActionDate (length: 10)
        public string RequisitionNumber { get; set; } // RequisitionNumber (length: 9)
        public string DocumentNumber { get; set; } // DocumentNumber (length: 8)
        public string AgencyPrefix { get; set; } // AgencyPrefix (length: 1)
        public string AgencyNumber { get; set; } // AgencyNumber (length: 6)
        public string DepositType { get; set; } // DepositType (length: 2)
        public string ChequeClearanceCode { get; set; } // ChequeClearanceCode (length: 10)
        public string ChequeNumber { get; set; } // ChequeNumber (length: 9)
        public string BankAccountNumber { get; set; } // BankAccountNumber (length: 17)
        public string UniqueUserCode { get; set; } // UniqueUserCode (length: 4)
        public virtual Payment Payment { get; set; } // FK_Payment_PaymentId
    }
}