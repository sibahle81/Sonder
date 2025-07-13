using RMA.Service.ClientCare.Contracts.Entities.Product;

using System.Collections.Generic;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class PolicyProductCategory
    {
        public int PolicyId { get; set; }
        public ProductOption ProductOption { get; set; }
        public string PolicyNumber { get; set; }
        public string ProductCategory { get; set; }
        public string ProductDescription { get; set; }
        public List<PolicyProductCategory> CategoryPolicies { get; set; }
        public int RmaBankAccountId { get; set; }
    }
}
