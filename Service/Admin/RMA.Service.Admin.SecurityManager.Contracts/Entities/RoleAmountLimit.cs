using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class RoleAmountLimit : AuditDetails
    {
        public int RoleAmountLimitId { get; set; } // RoleAmountLimitId (Primary key)
        public AmountLimitTypeEnum AmountLimitType { get; set; } // AmountLimitTypeId
        public int RoleId { get; set; } // RoleId
        public decimal? AmountLimit { get; set; } // AmountLimit
        public decimal? DaysLimit { get; set; } // DaysLimit
        public decimal? PdExtentLimit { get; set; } // PDExtentLimit
    }
}
