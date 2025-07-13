using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SkillCategory : AuditDetails
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int SkillSubCategoryId { get; set; }
    }
}