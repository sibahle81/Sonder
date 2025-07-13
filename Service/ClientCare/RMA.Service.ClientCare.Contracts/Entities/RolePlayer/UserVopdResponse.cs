using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class UserVopdResponse
    {
        public int UserVopdResponseId { get; set; } // UserVopdResponseId (Primary key)
        public VopdStatusEnum VopdStatus { get; set; } // VopdStatusId
        public string Reason { get; set; } // Reason (length: 255)
        public bool? Identity { get; set; } // Identity
        public bool? MaritalStatus { get; set; } // MaritalStatus
        public bool? Death { get; set; } // Death
        public System.DateTime? DateVerified { get; set; } // DateVerified
        public string IdNumber { get; set; } // IdNumber (length: 13)
        public bool? IsProcessed { get; set; } // IsProcessed
    }
}