using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserCompanyMap : AuditDetails
    {
        public int UserCompanyMapId { get; set; }
        public int? UserId { get; set; }
        public int CompanyId { get; set; }
        public int RoleId { get; set; }
        public UserCompanyMapStatusEnum UserCompanyMapStatus { get; set; }
        public int? UserActivationId { get; set; }

        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public string RoleName { get; set; }
    }
}