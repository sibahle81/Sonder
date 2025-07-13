namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventClaimRequirement
    {
        public PersonEventClaimRequirement()
        {
            ClaimRequirementCategory = new ClaimRequirementCategory();
        }

        public int PersonEventClaimRequirementId { get; set; }
        public int PersonEventId { get; set; }
        public int ClaimRequirementCategoryId { get; set; }
        public string Instruction { get; set; }
        public System.DateTime DateOpened { get; set; }
        public System.DateTime? DateClosed { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public bool? IsMinimumRequirement { get; set; }
        public bool? IsMemberVisible { get; set; }

        public ClaimRequirementCategory ClaimRequirementCategory { get; set; }
    }
}