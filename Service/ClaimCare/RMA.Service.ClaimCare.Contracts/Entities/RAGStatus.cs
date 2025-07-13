using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class RAGStatus : AuditDetails
    {
        public int? UserId { get; set; } // UserId
        public int WorkItemId { get; set; } // WorkItemId / ClaimId
        public WorkPoolEnum WorkPool { get; set; } // WorkPoolId / RoleId
        public DateTime? StartDateAndTime { get; set; } // StartDateAndTime
        public DateTime? EndDateAndTime { get; set; } // EndDateAndTime

        //ENUM => ID Conversions
        public int WorkPoolId
        {
            get => (int)WorkPool;
            set => WorkPool = (WorkPoolEnum)value;
        }
    }
}