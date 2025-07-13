using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class MemberSearch
    {
        public string MemberName { get; set; }

        public string MemberNumber { get; set; }

        public string CompensationFundReferenceNumber { get; set; }

        public string CompanyRegistrationNumber { get; set; }

        public int RolePlayerId { get; set; }

        public DateTime CreatedDate { get; set; }

        public string PolicyNumber { get; set; }

        public int IndustryId { get; set; }
    }
}
