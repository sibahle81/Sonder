using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserBrokerageMap : AuditDetails
    {
        public int UserId { get; set; } // UserId (Primary key)
        public int BrokerageId { get; set; } // BrokerageId (Primary key)
    }
}