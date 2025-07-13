using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class MyValuePlusMapping : CsvMapping<Load_MyValuePlu>
    {
        public MyValuePlusMapping()
        {
            //POLICY NUMBER
            this.MapProperty(0, data => data.ClientReference);
            
            //MEMBER
            this.MapProperty(1, data => data.ClientType);
            this.MapProperty(2, data => data.FirstName);
            this.MapProperty(3, data => data.Surname);
            this.MapProperty(4, data => data.MainMemberId);
            this.MapProperty(5, data => data.IdNumber);
            this.MapProperty(6, data => data.PassportNumber);
            this.MapProperty(7, data => data.DateOfBirth);
            this.MapProperty(8, data => data.Gender);
            this.MapProperty(9, data => data.JoinDate);

            //Product Details
            this.MapProperty(10, data => data.ProductOption);
            this.MapProperty(11, data => data.BenefitName);
            this.MapProperty(12, data => data.PremiumWaiver);
            this.MapProperty(13, data => data.VaPsOptions);
            this.MapProperty(14, data => data.AnnualIncreaseOption);
            this.MapProperty(15, data => data.IncreaseMonth);
            this.MapProperty(16, data => data.LifeCoverAmount);
            this.MapProperty(17, data => data.FuneralCoverAmount);

            this.MapProperty(18, data => data.LifePremium);
            this.MapProperty(19, data => data.FuneralPremium);
            this.MapProperty(20, data => data.TotalPremium);

            //Beneficiary Details	
            this.MapProperty(21, data => data.LifeBenefitSplit);
            this.MapProperty(22, data => data.FuneralBenefitSplit);

            //Affordibility
            this.MapProperty(23, data => data.AffordibilityChecked);


            //PREVIOUS INSURER
            this.MapProperty(24, data => data.PreviousInsurer);
            this.MapProperty(25, data => data.PreviousInsurerPolicyNumber);
            this.MapProperty(26, data => data.PreviousInsurerStartDate);
            this.MapProperty(27, data => data.PreviousInsurerEndDate);
            this.MapProperty(28, data => data.PreviousInsurerCoverAmount);

            //PHYSICAL ADDRESS
            this.MapProperty(29, data => data.Address1);
            this.MapProperty(30, data => data.Address2);
            this.MapProperty(31, data => data.City);
            this.MapProperty(32, data => data.Province);
            this.MapProperty(33, data => data.Country);
            this.MapProperty(34, data => data.PostalCode);

            //POSTAL ADDRESS
            this.MapProperty(35, data => data.PostalAddress1);
            this.MapProperty(36, data => data.PostalAddress2);
            this.MapProperty(37, data => data.PostalCity);
            this.MapProperty(38, data => data.PostalProvince);
            this.MapProperty(39, data => data.PostalCountry);
            this.MapProperty(40, data => data.PostalPostCode);

            //COMMUNICATION
            this.MapProperty(41, data => data.Telephone);
            this.MapProperty(42, data => data.Mobile);
            this.MapProperty(43, data => data.Email);
            this.MapProperty(44, data => data.PreferredCommunication);

            //EMPLOYEE DETAILS
            this.MapProperty(45, data => data.PayrollCode);
            this.MapProperty(46, data => data.Employer);
            this.MapProperty(47, data => data.EmployeeNumber);
            this.MapProperty(48, data => data.Department);

            //BANKING DETAILS
            this.MapProperty(49, data => data.PaymentMethod);
            this.MapProperty(50, data => data.Bank);
            this.MapProperty(51, data => data.BranchCode);
            this.MapProperty(52, data => data.AccountNo);
            this.MapProperty(53, data => data.AccountType);
            this.MapProperty(54, data => data.DebitOrderDay);

            this.MapProperty(55, data => data.RepIdNumber);

        }
    }
}
