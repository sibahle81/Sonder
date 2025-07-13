using RMA.Common.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class Country : AuditDetails
    {
        public string Name { get; set; }

        public override string ToString()
        {
            return Name;
        }
    }
}
