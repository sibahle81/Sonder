namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class FatalPDLumpsumInvoice
    {
        public int ClaimInvoiceId { get; set; } // ClaimInvoiceId (Primary key)
        public string Description { get; set; } // Description (length: 255)
        public int PayeeTypeId { get; set; } // PayeeTypeId
        public string Payee { get; set; } // Payee (length: 255)
        public int NoOfFamilyMembersBeforeDeath { get; set; } // NoOfFamilyMembersBeforeDeath
        public int NoOfFamilyMembersAfterDeath { get; set; } // NoOfFamilyMembersAfterDeath
        public decimal DeceasedContributionToIncome { get; set; } // DeceasedContributionToIncome
        public decimal TotalFamilyIncome { get; set; } // TotalFamilyIncome
        public decimal AvgIncomePerFamilyMember { get; set; } // AvgIncomePerFamilyMember
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public ClaimInvoice ClaimInvoice { get; set; }
        public int ClaimId { get; set; } // ClaimId
    }
}
