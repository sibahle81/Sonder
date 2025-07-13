using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class CauseOfDeathType : AuditDetails
    {
        public DeathTypeEnum? DeathType { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        //ENUM => ID Conversions
        public int DeathTypeId
        {
            get => (int)DeathType;
            set => DeathType = (DeathTypeEnum)value;
        }
    }
}