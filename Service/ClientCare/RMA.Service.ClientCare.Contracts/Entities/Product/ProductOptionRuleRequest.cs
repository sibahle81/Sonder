using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductOptionRuleRequest
    {
        public int ProductOptionId { get; set; }
        public List<RuleItem> RuleItems { get; set; }
    }
}