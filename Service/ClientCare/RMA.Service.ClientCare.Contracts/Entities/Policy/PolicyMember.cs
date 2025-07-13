namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyMember
    {
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public int RolePlayerId { get; set; }
        public string MemberName { get; set; }
        public string IdNumber { get; set; }
        public string EmailAddress { get; set; }
        public string CellPhoneNumber { get; set; }
        public int PreferredCommunicationTypeId { get; set; }
        public bool IsEuropAssist { get; set; }
    }
}
