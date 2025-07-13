using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Integrations.Contracts.Entities.Vopd
{
    public class VopdResponse
    {
        public int VopdResponseId { get; set; }
        public string IdNumber { get; set; }
        public int RolePlayerId { get; set; }
        public VopdStatusEnum VopdStatus { get; set; } // VopdStatusId
        public string Reason { get; set; }
        public bool Identity { get; set; }
        public bool MaritalStatus { get; set; }
        public bool Death { get; set; }
        public System.DateTime? DateVerified { get; set; } // DateVerified

        public int VopdStatusId
        {
            get => (int)VopdStatus;
            set => VopdStatus = (VopdStatusEnum)value;
        }
    }
}
