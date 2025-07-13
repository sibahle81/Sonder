using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ProductSkillCategoryRequest : AuditDetails
    {
        public int ProductId { get; set; }
        public List<int> SkillCategoryIds { get; set; }
    }
}