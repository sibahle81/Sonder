using RMA.Common.Entities;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class BankAccountVerificationRequest : AuditDetails
    {
        public int BankAccountVerificationRequestId { get; set; } // BankAccountVerificationRequestId (Primary key)
        public int BankAccountVerificationId { get; set; } // BankAccountVerificationId
        public int? UserId { get; set; } // UserId
        public string UserEmail { get; set; } // UserEmail (length: 50)
        public System.DateTime? RequestedDate { get; set; } // RequestedDate
        public System.DateTime? ResponseDate { get; set; } // ResponseDate
        public int? BeneficiaryId { get; set; } // BeneficiaryId
        public int? BankAccountId { get; set; } // BankAccountId
        public string AccountAcceptsCredits { get; set; } // AccountAcceptsCredits (length: 20)
        public string AccountAcceptsDebits { get; set; } // AccountAcceptsDebits (length: 20)
        public string AccountExists { get; set; } // AccountExists (length: 20)
        public string AccountIdMatch { get; set; } // AccountIdMatch (length: 20)
        public string AccountNumber { get; set; } // AccountNumber (length: 50)
        public string AccountOpen { get; set; } // AccountOpen (length: 20)
        public string AccountOpenGtThreeMonths { get; set; } // AccountOpenGtThreeMonths (length: 20)
        public string AccountType { get; set; } // AccountType (length: 20)
        public string AccountTypeValid { get; set; } // AccountTypeValid (length: 20)
        public string BranchCode { get; set; } // BranchCode (length: 20)
        public string EmailValid { get; set; } // EmailValid (length: 20)
        public string IdNumber { get; set; } // IdNumber (length: 15)
        public string InitialMatch { get; set; } // InitialMatch (length: 20)
        public string Initials { get; set; } // Initials (length: 50)
        public string LastName { get; set; } // LastName (length: 100)
        public string LastNameMatch { get; set; } // LastNameMatch (length: 20)
        public string MessageCode { get; set; } // MessageCode (length: 20)
        public string MessageDescription { get; set; } // MessageDescription
        public string Operator { get; set; } // Operator (length: 20)
        public string PhoneNumber { get; set; } // PhoneNumber (length: 15)
        public string EmailAddress { get; set; } // EmailAddress (length: 15)
        public string PhoneValid { get; set; } // PhoneValid (length: 20)
        public string TransactionReference { get; set; } // TransactionReference (length: 20)
        public string UserReference { get; set; } // UserReference (length: 50)
    }
}
