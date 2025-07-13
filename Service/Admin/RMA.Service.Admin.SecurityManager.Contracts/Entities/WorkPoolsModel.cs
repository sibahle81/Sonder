using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class WorkPoolsModel
    {
        public WorkPoolEnum WorkPool { get; set; }

        public int WorkPoolId => (int)WorkPool;

        public string WorkPoolName => WorkPool.DisplayAttributeValue();

        public int UserId { get; set; }
        public bool IsPoolSuperUser { get; set; }
        public bool IsWorkPoolActive { get; set; }
        public bool IsWorkPoolDeleted { get; set; }
        public bool IsWorkPoolUserActive { get; set; }
        public bool IsWorkPoolUserDeleted { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
    }
}
