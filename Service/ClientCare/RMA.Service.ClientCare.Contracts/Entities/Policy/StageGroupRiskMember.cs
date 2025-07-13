using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class StageGroupRiskMember
    {

        public int StageGroupRiskId { get; set; } // StageGroupRiskId (Primary key)
        public int ExcelRowNumber { get; set; } // ExcelRowNumber
        public string FileIdentifier { get; set; } // FileIdentifier (length: 50)
        public string SchemeNumber { get; set; } // SchemeNumber (length: 20)
        public string BranchName { get; set; } // SchemeNumber (length: 20)
        public int FinPayeeRolePlayerId { get; set; } // FinPayeeRolePlayerId
        public int EmployeeRolePlayerId { get; set; } // EmployeeRolePlayerId
        public string EmployeeIndustryNumber { get; set; } // EmployeeIndustryNumber (length: 100)
        public string EmployeeNumber { get; set; } // EmployeeNumber (length: 100)
        public string IdOrPassport { get; set; } // IdOrPassport (length: 20)
        public int IdentityTypeId { get; set; } // IdentityTypeId
        public System.DateTime DateOfBirth { get; set; } // DateOfBirth
        public string FirstName { get; set; } // FirstName (length: 50)
        public string Surname { get; set; } // Surname (length: 50)
        public GenderEnum Gender { get; set; } // GenderId
        public string MobileNumber { get; set; } // MobileNumber (length: 25)
        public string Email { get; set; } // Email (length: 50)
        public string PreferredStakeholderCommunication { get; set; } // PreferredStakeholderCommunication
        public int MemberPreferredMethodOfCommunicationId { get; set; } // MemberPreferredMethodOfCommunicationId
        public decimal MonthlyRiskSalary { get; set; } // MonthlyRiskSalary
        public System.DateTime EmployeeStartDate { get; set; } // EmployeeStartDate
        public System.DateTime PolicyStartDate { get; set; } // PolicyStartDate
        public string BrokerageFspNumber { get; set; } // BrokerageFspNumber (length: 20)
        public string RepresentativeIdNumber { get; set; } // RepresentativeIdNumber (length: 20)
        public string PolicyNumber { get; set; } // PolicyNumber (length: 50)
        public int? PolicyId { get; set; } // PolicyId
        public int ProductOptionId { get; set; } // ProductOptionId
        public int BenefitId { get; set; } // BenefitId
        public int BenefitMultiplier { get; set; } // BenefitMultiplier
        public int? WizardId { get; set; } // WizardId
        public GroupRiskPolicyActionTypeEnum GroupRiskPolicyActionType { get; set; } // GroupRiskPolicyActionTypeId
        public GroupRiskStagingStatusTypeEnum GroupRiskStagingStatusType { get; set; } // GroupRiskStagingStatusTypeId
        public string Escalation { get; set; } // Escalation (length: 500)
        public string Note { get; set; } // Note (length: 500)
        public bool IsDeleted { get; set; } // IsDeleted
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
    }
}
