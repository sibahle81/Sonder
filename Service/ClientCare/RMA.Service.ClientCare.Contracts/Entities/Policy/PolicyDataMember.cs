using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyDataMember
    {
        public int RolePlayerId { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public int IdTypeId { get; set; }
        public string IdNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime? PassportExpiryDate { get; set; }
        public string Nationality { get; set; }
        public string Gender { get; set; }
        public int MemberTypeId { get; set; }
        public int BenefitId { get; set; }
        public string BenefitCode { get; set; }
        public decimal Premium { get; set; }
        public decimal CoverAmount { get; set; }
        public DateTime? PolicyInceptionDate { get; set; }
        public DateTime? EmploymentStartDate { get; set; }
        public bool IsBeneficiary { get; set; }
        public string EmailAddress { get; set; }
        public string MobileNumber { get; set; }
        public string SecondaryNumber { get; set; }
        public int PreferredCommunicationType { get; set; } = 4;
        public decimal MonthlyPreTaxIncome { get; set; }
        public int MemberAction { get; set; }   // 1=Add, 2=Update, 3=Delete
        public bool IsAlive { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public string DeathCertificateNumber { get; set; }
        public bool IsVopdVerified { get; set; }
        public DateTime? DateVopdVerified { get; set; }

        public InsuredLifeRemovalReasonEnum? InsuredLifeRemovalReason { get; set; }
        public List<PolicyDataAddress> Addresses { get; set; }

        public bool IsStudying { get; set; } // IsStudying
        public bool IsDisabled { get; set; } // IsDisabled


    }
}
