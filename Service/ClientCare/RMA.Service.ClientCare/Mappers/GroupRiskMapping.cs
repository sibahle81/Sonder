using RMA.Service.ClientCare.Contracts.Entities.Policy;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{

    public class GroupRiskGLAProductOptionNewMemberMapping : CsvMapping<GroupRiskMemberRecord>
    {

        public GroupRiskGLAProductOptionNewMemberMapping()
        {
            this.MapProperty(0, data => data.EmployeeIndustryNumber);
            this.MapProperty(1, data => data.IdentityType);
            this.MapProperty(2, data => data.IdOrPassport);
            this.MapProperty(3, data => data.DateOfBirth);
            this.MapProperty(4, data => data.FirstName);
            this.MapProperty(5, data => data.Surname);
            this.MapProperty(6, data => data.Gender);
            this.MapProperty(7, data => data.EmployeeNumber);
            this.MapProperty(8, data => data.Cell);
            this.MapProperty(9, data => data.Email);
            this.MapProperty(10, data => data.PreferredStakeholderCommunication);
            this.MapProperty(11, data => data.MemberPreferredMethodOfCommunication);
            this.MapProperty(12, data => data.ProductBenefitOption);
            this.MapProperty(13, data => data.MonthlyRiskSalary);
            this.MapProperty(14, data => data.BenefitMultiplier);
            this.MapProperty(15, data => data.EmployeeStartDate);
            this.MapProperty(16, data => data.PolicyStartDate);
        }
    }

    public class GroupRiskGPAProductOptionNewMemberMapping : CsvMapping<GroupRiskMemberRecord>
    {
        public GroupRiskGPAProductOptionNewMemberMapping()
        {
            this.MapProperty(0, data => data.EmployeeIndustryNumber);
            this.MapProperty(1, data => data.IdentityType);
            this.MapProperty(2, data => data.IdOrPassport);
            this.MapProperty(3, data => data.DateOfBirth);
            this.MapProperty(4, data => data.FirstName);
            this.MapProperty(5, data => data.Surname);
            this.MapProperty(6, data => data.Gender);
            this.MapProperty(7, data => data.EmployeeNumber);
            this.MapProperty(8, data => data.Cell);
            this.MapProperty(9, data => data.Email);
            this.MapProperty(10, data => data.PreferredStakeholderCommunication);
            this.MapProperty(11, data => data.MemberPreferredMethodOfCommunication);
            this.MapProperty(12, data => data.ProductBenefitOption);
            this.MapProperty(13, data => data.MonthlyRiskSalary);
            this.MapProperty(14, data => data.EmployeeStartDate);
            this.MapProperty(15, data => data.PolicyStartDate);
        }
    }

    public class GroupRiskOtherProductOptionNewMemberMapping : CsvMapping<GroupRiskMemberRecord>
    {
        public GroupRiskOtherProductOptionNewMemberMapping()
        {
            this.MapProperty(0, data => data.EmployeeIndustryNumber);
            this.MapProperty(1, data => data.IdentityType);
            this.MapProperty(2, data => data.IdOrPassport);
            this.MapProperty(3, data => data.DateOfBirth);
            this.MapProperty(4, data => data.FirstName);
            this.MapProperty(5, data => data.Surname);
            this.MapProperty(6, data => data.Gender);
            this.MapProperty(7, data => data.EmployeeNumber);
            this.MapProperty(8, data => data.Cell);
            this.MapProperty(9, data => data.Email);
            this.MapProperty(10, data => data.PreferredStakeholderCommunication);
            this.MapProperty(11, data => data.MemberPreferredMethodOfCommunication);
            this.MapProperty(12, data => data.MonthlyRiskSalary);
            this.MapProperty(13, data => data.EmployeeStartDate);
            this.MapProperty(14, data => data.PolicyStartDate);
        }
    }
}
