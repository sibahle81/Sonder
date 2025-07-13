namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class WizardConfigurationRouteSetting : Common.Entities.AuditDetails
    {
        public int WizardConfigurationId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int? RoutingUserId { get; set; }
        public int? RoutingRoleId { get; set; }
        public int? SendForReviewUserId { get; set; }
        public int? SendForReviewRoleId { get; set; }
        public string MessageTemplate { get; set; }
        public string WorkflowType { get; set; }
        public string WorkflowTypeDescription { get; set; }
        public string ActionLink { get; set; }
        public string NotificationTitle { get; set; }
    }
}
