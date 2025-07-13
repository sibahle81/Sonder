using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
    public class DeceasedDetails
    {
        public string Title { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }

        public string IdNumber { get; set; }
        public string MemberStatus { get; set; }

        public string DeathType { get; set; }
        public string DhaReferenceNo { get; set; }
        public string DeathCertificateNo { get; set; }

        public DateTime? DateOfDeath { get; set; }
        public DateTime? DateNotified { get; set; }
    }
}
