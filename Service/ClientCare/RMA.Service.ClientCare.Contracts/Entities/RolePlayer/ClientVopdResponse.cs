using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class ClientVopdResponse
    {
        public int VopdResponseId { get; set; }
        public int RolePlayerId { get; set; }
        public VopdStatusEnum VopdStatus { get; set; }
        public string Reason { get; set; }
        public bool? Identity { get; set; }
        public bool? MaritalStatus { get; set; }
        public bool? Death { get; set; }
        public System.DateTime? DateVerified { get; set; }
        public string IdNumber { get; set; }
        public string Firstname { get; set; }
        public string Surname { get; set; }
        public string DeceasedStatus { get; set; }
        public string DateOfDeath { get; set; }
        public System.DateTime? SubmittedDate { get; set; }
        public System.DateTime? ResubmittedDate { get; set; }
        public int? OverrideCount { get; set; }
    }
}