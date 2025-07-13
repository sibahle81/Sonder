using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class RateIndustry
    {
        public int Id { get; set; }
        public string Industry { get; set; }
        public string IndustryGroup { get; set; }
        public string EmpCat { get; set; }
        public SkillSubCategoryEnum? SkillSubCategory { get; set; }
        public decimal IndRate { get; set; }
        public int PreviousYear { get; set; }
        public decimal PreviousYearRate { get; set; }
        public int RatingYear { get; set; }
        public decimal PremiumPerMember { get; set; }
        public DateTime LoadDate { get; set; }

        //Front End Compatibility
        public int? SkillSubCategoryId
        {
            get => (int?)SkillSubCategory;
            set => SkillSubCategory = (SkillSubCategoryEnum?)value;
        }
    }
}