using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class Bank : AuditDetails
    {
        public string Name { get; set; }
        public string UniversalBranchCode { get; set; }
        public bool IsForeign { get; set; }
    }
}