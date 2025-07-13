namespace RMA.Service.ClientCare.BusinessProcessTasks.InterBankTransfer.Model
{
    public class StartWizardRequest
    {
        public string Type { get; set; }
        public int LinkedItemId { get; set; }
        public string Data { get; set; }
        public string LockedToUser { get; set; }
        public string CustomStatus { get; set; }
        public int? CustomRoutingRoleId { get; set; }
    }
}
