using RMA.Service.ClientCare.Contracts.Entities.Policy.Common;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.MVP
{
    public class Member
    {
        public MemberType MemberType { get; set; }
        public ChangeType ChangeType { get; set; }
        public string FirstName { get; set; }
        public string Initials { get; set; }
        public string Surname { get; set; }
        public DateTime DateOfBirth { get; set; } = DateTime.MinValue;
        public string Gender { get; set; }
        public string IDNumber { get; set; } = "";
        public string PassportNumber { get; set; } = "";

        public string BeneficiaryLifeAllocation { get; set; } = "";
        public string BeneficiaryFuneralAllocation { get; set; } = "";

        public PolicyCover PolicyCover { get; set; }

        public ContactDetails ContactDetails { get; set; }

        public List<PreviousInsurer> PreviousInsurers { get; set; }
    }
}
