namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ImportInsuredLivesRequest
    {
        public string Company { get; set; }
        public string FileIdentifier { get; set; }
        public int Version { get; set; }
        public bool SaveInsuredLives { get; set; }
        public bool MembersUploaded { get; set; }
        public bool CreateNewPolicies { get; set; }
        public bool GroupWelcomeLetter { get; set; }
        public bool GroupPolicySchedule { get; set; }
        public bool GroupTermsAndConditions { get; set; }
        public bool MemberWelcomeLetter { get; set; }
        public bool MemberPolicySchedule { get; set; }
        public bool MemberTermsAndConditions { get; set; }
        public int WizardId { get; set; } = 0;
        public int PolicyId { get; set; } = 0;
    }
}
