using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class DeclarationAllowance
    {
        public int DeclarationAllowanceId { get; set; } // DeclarationAllowanceId (Primary key)
        public int DeclarationId { get; set; } // DeclarationId
        public AllowanceTypeEnum AllowanceType { get; set; } // AllowanceTypeId
        public decimal? Allowance { get; set; } // Allowance
    }
}