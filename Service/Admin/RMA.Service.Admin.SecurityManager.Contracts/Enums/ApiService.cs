using System.ComponentModel;

namespace RMA.Service.Admin.SecurityManager.Contracts.Enums
{
    public enum ApiService
    {
        [Description("Master Data")] MasterData,
        [Description("Product Manager")] ProductManager,
        [Description("Rules Engine")] RulesEngine,

        [Description("Business Process Manager")]
        BusinessProcessManager,

        [Description("Lead Manager")] LeadManager,
        [Description("Client Manager")] ClientManager,
        [Description("Policy Manager")] PolicyManager,
        [Description("Billing Manager")] BillingManager
    }
}