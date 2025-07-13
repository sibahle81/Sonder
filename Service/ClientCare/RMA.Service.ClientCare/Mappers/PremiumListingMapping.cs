using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class PremiumListingMapping : CsvMapping<Load_PremiumListing>
    {
        #region Constructors and Destructors

        public PremiumListingMapping()
        {
            this.MapProperty(0, data => data.Company);
            this.MapProperty(1, data => data.PolicyNumber);
            this.MapProperty(2, data => data.ClientReference);
            this.MapProperty(3, data => data.ClientType);
            this.MapProperty(4, data => data.FirstName);
            this.MapProperty(5, data => data.Surname);
            this.MapProperty(6, data => data.MainMemberId);
            this.MapProperty(7, data => data.IdNumber);
            this.MapProperty(8, data => data.PassportNumber);
            this.MapProperty(9, data => data.DateOfBirth);
            this.MapProperty(10, data => data.RetirementAge);
            this.MapProperty(11, data => data.BenefitName);
            this.MapProperty(12, data => data.JoinDate);
            this.MapProperty(13, data => data.PreviousInsurer);
            this.MapProperty(14, data => data.PreviousInsurerPolicyNumber);
            this.MapProperty(15, data => data.PreviousInsurerStartDate);
            this.MapProperty(16, data => data.PreviousInsurerEndDate);
            this.MapProperty(17, data => data.Address1);
            this.MapProperty(18, data => data.Address2);
            this.MapProperty(19, data => data.City);
            this.MapProperty(20, data => data.Province);
            this.MapProperty(21, data => data.Country);
            this.MapProperty(22, data => data.PostalCode);
            this.MapProperty(23, data => data.PostalAddress1);
            this.MapProperty(24, data => data.PostalAddress2);
            this.MapProperty(25, data => data.PostalCity);
            this.MapProperty(26, data => data.PostalProvince);
            this.MapProperty(27, data => data.PostalCountry);
            this.MapProperty(28, data => data.PostalPostCode);
            this.MapProperty(29, data => data.Telephone);
            this.MapProperty(30, data => data.Mobile);
            this.MapProperty(31, data => data.Email);
            this.MapProperty(32, data => data.PreferredCommunication);
        }

        #endregion
    }
}