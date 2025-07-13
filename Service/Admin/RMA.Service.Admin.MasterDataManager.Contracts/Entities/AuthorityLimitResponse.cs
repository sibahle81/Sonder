using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class AuthorityLimitResponse
    {
        public bool UserHasAuthorityLimit { get; set; }
        public string Reason { get; set; }
        public List<AuthorityLimitConfiguration> AuthorityLimitConfigurations { get; set; }
    }
}