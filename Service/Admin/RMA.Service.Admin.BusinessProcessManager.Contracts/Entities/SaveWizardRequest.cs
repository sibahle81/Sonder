namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class SaveWizardRequest
    {
        public int WizardId { get; set; }
        public int CurrentStep { get; set; }
        public string Data { get; set; }
        public int? CustomRoutingRoleId { get; set; }
        public bool UpdateCustomRoutingRoleId { get; set; }
        public string CustomStatus { get; set; }
        public bool UpdateCustomStatus { get; set; }
        public string LockedToUser { get; set; }
        public bool UpdateLockedUser { get; set; }
        public string WizardName { get; set; }
    }
}