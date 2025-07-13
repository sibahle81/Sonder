using System;
using System.Collections.Generic;
namespace RMA.Service.ClientCare.Contracts.Entities.Policy.MVP
{
    public class PolicyRequest
    {
        public string Product { get; set; } = "My Value Plus";
        public string PolicyNumber { get; set; } = "";
        public string RepresentativeID { get; set; }

        public string RequestGUID { get; set; }

        public Member MainMember { get; set; }
        public Member Spouse { get; set; }
        public List<Member> Children { get; set; }
        public List<Member> Parents { get; set; }
        public List<Member> Extended { get; set; }
        public List<Member> Beneficiaries { get; set; }

        public Common.Address PhysicalAddress { get; set; }
        public Common.Address PostalAddress { get; set; }

        public Common.EmployerDetails EmployerDetails { get; set; }

        public Common.BankingDetails BankingDetails { get; set; }

        public string AffordabilityStatus { get; set; } = "";
        public string ProductOption { get; set; }
        public string AnnualIncreaseOption { get; set; }
        public int IncreaseMonth { get; set; } = 0;
        public int DebitOrderDay { get; set; } = 0;
        public string PaymentMethod { get; set; } = "";
        public decimal LifeBenefitSpilt { get; set; } = 0;
        public decimal FuneralBenefitSpilt { get; set; } = 0;

        public string PremiumWaiver { get; set; }
        public string VaPsOptions { get; set; }

        //Properties for TimeSeries Report
        public DateTime LeadSubmittedDate { get; set; }
        public DateTime LeadAPIReceivedDate { get; set; }
        public DateTime LeadServiceBusQueuedDate { get; set; }

    }
}
