using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class BillingPolicyChangeMessage 
    {
        public BillingPolicyChangeDetail OldPolicyDetails { get; set; }
        public BillingPolicyChangeDetail NewPolicyDetails { get; set; }
        public bool IsGroupPolicy { get; set; }
        public PolicyChangeMessageTypeEnum PolicyChangeMessageType { get; set; }
        public string RequestedByUsername {set;get;}

        public SourceModuleEnum SourceModule { get; set; }
        public decimal AdjustmentAmount { get; set; }
        public string TransactionReason { get; set; }
    }
}
