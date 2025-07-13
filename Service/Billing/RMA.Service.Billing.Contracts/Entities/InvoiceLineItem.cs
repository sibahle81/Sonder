using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class InvoiceLineItem
    {
        public int InvoiceLineItemsId { get; set; } // InvoiceLineItemsId (Primary key)
        public int InvoiceId { get; set; } // InvoiceId
        public decimal? Amount { get; set; } // Amount
        public int? PolicyId { get; set; } // PolicyId
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public PolicyStatusEnum? PolicyStatus { get; set; } // PolicyStatusId
        public bool? IsExcludedDueToStatus { get; set; } // IsExcludedDueToStatus
        public string InsurableItem { get; set; } // InsurableItem
        public int? NoOfEmployees { get; set; } // NoOfEmployees
        public decimal? Earnings { get; set; } // Earnings
        public decimal? Rate { get; set; } // Rate
        public decimal? PremiumPayable { get; set; } // PremiumPayable
        public decimal? Percentage { get; set; } // Percentage
        public decimal? PaymentAmount { get; set; } // PaymentAmount
        public decimal? ActualPremium { get; set; } // ActualPremium
        public System.DateTime? CoverStartDate { get; set; } // CoverStartDate
        public System.DateTime? CoverEndDate { get; set; } // CoverEndDate
        public bool IsActive { get; set; } // IsActive

        public int? BenefitPayrollId { get; set; }
        public int? BenefitRateId { get; set; }

        public virtual Invoice Invoice { get; set; }

    }
}