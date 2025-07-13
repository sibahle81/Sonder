using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class Industry : AuditDetails
    {
        public string Name { get; set; }
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassId
        public string Description { get; set; }
    }
}