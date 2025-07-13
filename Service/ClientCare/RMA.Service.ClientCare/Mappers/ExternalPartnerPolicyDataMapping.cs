using RMA.Service.ClientCare.Database.Entities;
using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class ExternalPartnerPolicyDataMapping : CsvMapping<Load_ExternalPartnerPolicyData>
    {
        #region Constructors and Destructors

        public ExternalPartnerPolicyDataMapping()
        {
            this.MapProperty(0, data => data.PolicyNumber);
            this.MapProperty(1, data => data.PolicyUmaid);
            this.MapProperty(2, data => data.ProductName);
            this.MapProperty(3, data => data.OptionName);
            this.MapProperty(4, data => data.PolicyInceptionDate);
            this.MapProperty(5, data => data.PolicyCancellationDate);
            this.MapProperty(6, data => data.PolicyStatus);
            this.MapProperty(7, data => data.PolicyCreatedUser);
            this.MapProperty(8, data => data.PolicyCreatedDate);
            this.MapProperty(9, data => data.ClientFirstName);
            this.MapProperty(10, data => data.ClientSurname);
            this.MapProperty(11, data => data.ClientIdNumber);
            this.MapProperty(12, data => data.ClientDateOfBirth);
            this.MapProperty(13, data => data.ClientAge);
            this.MapProperty(14, data => data.ClientGender);
            this.MapProperty(15, data => data.OptionSelection);
            this.MapProperty(16, data => data.MemberType);
            this.MapProperty(17, data => data.LastName);
            this.MapProperty(18, data => data.FirstName);
            this.MapProperty(19, data => data.IdNumber);
            this.MapProperty(20, data => data.DateOfBirth);
            this.MapProperty(21, data => data.MemberAge);
            this.MapProperty(22, data => data.Gender);
            this.MapProperty(23, data => data.IntermediaryGroupName);
            this.MapProperty(24, data => data.PolicyPaymentMethod);
            this.MapProperty(25, data => data.SchemeName);
            this.MapProperty(26, data => data.Scheme);
            this.MapProperty(27, data => data.ProductOptionSetupName);
            this.MapProperty(28, data => data.MemberPremium);
            this.MapProperty(29, data => data.PolicyGrossPremium);
            this.MapProperty(30, data => data.Salary);
            this.MapProperty(31, data => data.ApprovedCover);
            this.MapProperty(32, data => data.FreeCoverLimit);
            this.MapProperty(33, data => data.CreatedMonth);
            this.MapProperty(34, data => data.PolicyCancelledUser);
            this.MapProperty(35, data => data.CancelledReason);
            this.MapProperty(36, data => data.PolicyUpdatedDate);
            this.MapProperty(37, data => data.PremiumFrequency);
        }

        #endregion
    }
}
