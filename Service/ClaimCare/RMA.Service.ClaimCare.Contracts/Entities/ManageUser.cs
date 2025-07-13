using RMA.Common.Entities;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ManageUser : AuditDetails
    {
        public int? RolePlayerId { get; set; } // UserId
        public System.DateTime StartTimeOff { get; set; } // StartTimeOff
        public System.DateTime EndTimeOff { get; set; } // EndTimeOff
        public int ManageUserId { get; set; }
    }
}
