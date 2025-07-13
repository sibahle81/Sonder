using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class MemberVopdStatus
    {
        public string MemberType { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public string MemberName { get; set; }
        public string IdNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int Age { get; set; }
        public DateTime? JoinDate { get; set; }
        public string VopdProcessStatus { get; set; }
        public string VopdStatus { get; set; }
        public DateTime? DateVerified { get; set; }
    }
}
