namespace RMA.Service.Billing.Contracts.Entities
{
    public class TermsDebitOrderDetail
    {
        public int TermDebitOrderRolePlayerBankingDetailId { get; set; } // TermDebitOrderRolePlayerBankingDetailId (Primary key)
        public int TermArrangementId { get; set; } // TermArrangementId
        public int? RolePlayerBankingId { get; set; } // RolePlayerBankingId
        public bool IsActive { get; set; } // IsActive
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
