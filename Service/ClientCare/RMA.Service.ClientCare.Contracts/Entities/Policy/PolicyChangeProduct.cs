using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyChangeProduct
    {
        public int PolicyChangeProductId { get; set; }
        public int PolicyId { get; set; }
        public System.DateTime EffectiveDate { get; set; }
        public int ProductOptionId { get; set; }
        public PolicyChangeStatusEnum PolicyChangeStatus { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public List<PolicyChangeBenefit> PolicyChangeBenefits { get; set; }
    }
}
