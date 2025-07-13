using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Entities.CFP
{
    public class Member
    {
        public string MemberType { get; set; }
        public ChangeType ChangeType { get; set; }
        public string FirstName { get; set; }
        public string Initials { get; set; }
        public string Surname { get; set; }
        public DateTime DateOfBirth { get; set; } = DateTime.MinValue;
        public string Gender { get; set; }
        public string IDNumber { get; set; } = "";
        public string PassportNumber { get; set; } = "";

        public PolicyCover PolicyCover { get; set; }

        public ContactDetails ContactDetails { get; set; }

        public List<PreviousInsurer> PreviousInsurers { get; set; }
    }
}
