
using RMA.Common.Entities.DatabaseQuery;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class EmployeeSearchRequest
    {
        public int? EmployerRolePlayerId { get; set; }
        public PagedRequest PagedRequest { get; set; }
    }
}