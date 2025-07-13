using RMA.Common.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitSkillCategoryRequest : AuditDetails
    {
        public int BenefitId { get; set; }
        public List<int> SkillCategoryIds { get; set; }
    }
}