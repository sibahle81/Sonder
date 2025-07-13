using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class BulkWriteOffModel
    {
        public string MemberNumber { get; set; }
        public string MemberName { get; set; }
        public int? FinancialYear { get; set; }
        public int? UnderwritingYear { get; set; }
        public string AgeBalance { get; set; }
        public string InterestReversalReference { get; set; }
        public decimal? InterestReversalAmount { get; set; }
        public string PremiumWriteOffReference { get; set; }
        public decimal? PremiumWriteOffAmount { get; set; }
        public string Reason { get; set; }
        public string DebtorsClerk { get; set; }
        public string Status { get; set; }
    }
}
