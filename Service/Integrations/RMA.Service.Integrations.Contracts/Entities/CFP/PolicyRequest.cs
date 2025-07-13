using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.CFP
{
    public class PolicyRequest
    {
        public string Product { get; set; } = "Funeral";
        public string PolicyNumber { get; set; } = "";
        public string RepresentativeID { get; set; }

        public string RequestGUID { get; set; }

        public Member MainMember { get; set; }
        public Member Spouse { get; set; }
        public List<Member> Children { get; set; }
        public List<Member> Parents { get; set; }
        public List<Member> Extended { get; set; }
        public List<Member> Beneficiaries { get; set; }

        public Address PhysicalAddress { get; set; }
        public Address PostalAddress { get; set; }

        public EmployerDetails EmployerDetails { get; set; }

        public BankingDetails BankingDetails { get; set; }

        public string AffordabilityStatus { get; set; } = "";
        public string ProductOption { get; set; }
        public string AnnualIncreaseOption { get; set; }
        public int IncreaseMonth { get; set; } = 0;
        public int DebitOrderDay { get; set; } = 0;

    }
}
