namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimReferralQueryType
    {
        public int ReferralQueryTypeId { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public int? DepartmentId { get; set; }
        public int? PriorityId { get; set; }
        public int? FirstLineSupportRoleId { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public int? WizardConfigurationId { get; set; }

    }
}
