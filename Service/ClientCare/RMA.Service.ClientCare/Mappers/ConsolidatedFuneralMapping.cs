using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class ConsolidatedFuneralMapping : CsvMapping<Load_ConsolidatedFuneral>
    {
        public ConsolidatedFuneralMapping()
        {
            this.MapProperty(0, data => data.ClientReference);
            this.MapProperty(1, data => data.ClientType);
            this.MapProperty(2, data => data.FirstName);
            this.MapProperty(3, data => data.Surname);
            this.MapProperty(4, data => data.MainMemberId);
            this.MapProperty(5, data => data.IdNumber);
            this.MapProperty(6, data => data.PassportNumber);
            this.MapProperty(7, data => data.DateOfBirth);
            this.MapProperty(8, data => data.Gender);
            this.MapProperty(9, data => data.BenefitName);
            this.MapProperty(10, data => data.JoinDate);
            this.MapProperty(11, data => data.AffordibilityChecked);
            this.MapProperty(12, data => data.Premium);
            this.MapProperty(13, data => data.CoverAmount);
            this.MapProperty(14, data => data.PreviousInsurer);
            this.MapProperty(15, data => data.PreviousInsurerPolicyNumber);
            this.MapProperty(16, data => data.PreviousInsurerStartDate);
            this.MapProperty(17, data => data.PreviousInsurerEndDate);
            this.MapProperty(18, data => data.PreviousInsurerCoverAmount);
            this.MapProperty(19, data => data.Address1);
            this.MapProperty(20, data => data.Address2);
            this.MapProperty(21, data => data.City);
            this.MapProperty(22, data => data.Province);
            this.MapProperty(23, data => data.Country);
            this.MapProperty(24, data => data.PostalCode);
            this.MapProperty(25, data => data.PostalAddress1);
            this.MapProperty(26, data => data.PostalAddress2);
            this.MapProperty(27, data => data.PostalCity);
            this.MapProperty(28, data => data.PostalProvince);
            this.MapProperty(29, data => data.PostalCountry);
            this.MapProperty(30, data => data.PostalPostCode);
            this.MapProperty(31, data => data.Telephone);
            this.MapProperty(32, data => data.Mobile);
            this.MapProperty(33, data => data.Email);
            this.MapProperty(34, data => data.PreferredCommunication);
            this.MapProperty(35, data => data.ProductOption);
            this.MapProperty(36, data => data.AnnualIncreaseOption);
            this.MapProperty(37, data => data.IncreaseMonth);
            this.MapProperty(38, data => data.PayrollCode);
            this.MapProperty(39, data => data.Employer);
            this.MapProperty(40, data => data.PersalNumber);
            this.MapProperty(41, data => data.Department);
            this.MapProperty(42, data => data.PaymentMethod);
            this.MapProperty(43, data => data.Bank);
            this.MapProperty(44, data => data.BranchCode);
            this.MapProperty(45, data => data.AccountNo);
            this.MapProperty(46, data => data.AccountType);
            this.MapProperty(47, data => data.DebitOrderDay);
            this.MapProperty(48, data => data.RepIdNumber);
        }
    }
}
