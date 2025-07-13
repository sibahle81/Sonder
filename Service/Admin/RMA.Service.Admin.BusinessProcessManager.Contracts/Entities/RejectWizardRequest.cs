namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class RejectWizardRequest
    {
        public int WizardId { get; set; }
        public string Comment { get; set; }
        public string RejectedBy { get; set; }
    }
}