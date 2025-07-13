using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductRuleRequest
    {
        public int ProductId { get; set; }
        public List<RuleItem> RuleItems { get; set; }
    }
}