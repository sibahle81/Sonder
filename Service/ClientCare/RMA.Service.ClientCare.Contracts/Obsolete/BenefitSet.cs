using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class BenefitSet
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public IEnumerable<int> BenefitIds { get; set; }
        public IEnumerable<int> SkillCategoryIds { get; set; }

        public bool CanEdit { get; set; }
        public bool CanAdd { get; set; }
        public bool CanRemove { get; set; }

        public int Id { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}