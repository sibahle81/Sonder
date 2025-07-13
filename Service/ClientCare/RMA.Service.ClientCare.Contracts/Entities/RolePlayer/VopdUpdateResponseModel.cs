
using System;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class VopdUpdateResponseModel
    {
        public string IdNumber { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public string DeceasedStatus { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public DateTime VopdDatetime { get; set; }
        public string ModifiedBy { get; set; }
        public Guid FileIdentifier { get; set; }
    }
}
