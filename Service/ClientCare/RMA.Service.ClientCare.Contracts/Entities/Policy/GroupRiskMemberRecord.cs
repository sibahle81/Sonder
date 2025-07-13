using RMA.Service.ClientCare.Contracts.Attributes;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class GroupRiskMemberRecord
    {
        public int ExcelRowNumber { get; set; }
        public Guid FileIdentifier { get; set; }
        public int SchemeRolePlayerPayeeId { get; set; }
        public string SchemeNumber { get; set; }
        public string BranchName { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string EmployeeIndustryNumber { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string IdentityType { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string IdOrPassport { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string DateOfBirth { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string FirstName { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string Surname { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string Gender { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string Cell { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string Email { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string PreferredStakeholderCommunication { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string MemberPreferredMethodOfCommunication { get; set; }
        public int ProductOptionId { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string ProductBenefitOption { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string MonthlyRiskSalary { get; set; }
        public int BenefitMultiplier { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string EmployeeStartDate { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string PolicyStartDate { get; set; }
        public string BrokerageFspNumber { get; set; }
        public string RepresentativeIdNumber { get; set; }
        [ImportFieldParameter(IsRequiredForStaging = true)]
        public string EmployeeNumber { get; set; }
        public string PolicyNumber { get; set; }
        public string PolicyAction { get; set; }
    }
}
