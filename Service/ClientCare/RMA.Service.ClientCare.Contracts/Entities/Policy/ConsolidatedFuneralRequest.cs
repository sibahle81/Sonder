using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ConsolidatedFuneralRequest
    {
        public string Company { get; set; }
        public Guid FileIdentifier { get; set; }
        public bool? CreateNewPolicies { get; set; }
        public PolicyOnboardOptionEnum? PolicyOnboardOption { get; set; }
        public string PolicyNumber { get; set; }
    }
}
