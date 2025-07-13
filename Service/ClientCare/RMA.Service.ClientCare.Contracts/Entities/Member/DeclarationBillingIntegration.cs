using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class DeclarationBillingIntegration
    {
        public int DeclarationBillingIntegrationId { get; set; }
        public int DeclarationId { get; set; }
        public decimal Amount { get; set; }
        public DeclarationBillingIntegrationStatusEnum DeclarationBillingIntegrationStatus { get; set; }
        public DeclarationBillingIntegrationTypeEnum DeclarationBillingIntegrationType { get; set; }
        public System.DateTime? BillingProcessedDate { get; set; }
    }
}