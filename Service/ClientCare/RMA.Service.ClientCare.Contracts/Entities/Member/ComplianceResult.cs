using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class ComplianceResult
    {
        public DebtorStatusEnum? DebtorStatus { get; set; }
        public bool IsBillingCompliant { get; set; }
        public bool IsDeclarationCompliant { get; set; }
        public List<string> Reasons { get; set; }
        public bool IsApplicable { get; set; }
    }
}