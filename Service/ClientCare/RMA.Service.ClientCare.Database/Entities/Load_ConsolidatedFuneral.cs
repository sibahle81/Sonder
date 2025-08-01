//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Database.Entities
{
    public partial class Load_ConsolidatedFuneral : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public System.Guid FileIdentifier { get; set; } // FileIdentifier
        public string ClientReference { get; set; } // ClientReference (length: 32)
        public string ClientType { get; set; } // ClientType (length: 32)
        public string FirstName { get; set; } // FirstName (length: 256)
        public string Surname { get; set; } // Surname (length: 256)
        public string MainMemberId { get; set; } // MainMemberID (length: 32)
        public string IdNumber { get; set; } // IdNumber (length: 32)
        public string PassportNumber { get; set; } // PassportNumber (length: 32)
        public string DateOfBirth { get; set; } // DateOfBirth (length: 32)
        public string Gender { get; set; } // Gender (length: 16)
        public string BenefitName { get; set; } // BenefitName (length: 128)
        public string JoinDate { get; set; } // JoinDate (length: 32)
        public string AffordibilityChecked { get; set; } // AffordibilityChecked (length: 32)
        public string Premium { get; set; } // Premium (length: 64)
        public string CoverAmount { get; set; } // CoverAmount (length: 64)
        public string PreviousInsurer { get; set; } // PreviousInsurer (length: 256)
        public string PreviousInsurerPolicyNumber { get; set; } // PreviousInsurerPolicyNumber (length: 50)
        public string PreviousInsurerStartDate { get; set; } // PreviousInsurerStartDate (length: 32)
        public string PreviousInsurerEndDate { get; set; } // PreviousInsurerEndDate (length: 32)
        public string PreviousInsurerCoverAmount { get; set; } // PreviousInsurerCoverAmount (length: 64)
        public string Address1 { get; set; } // Address1 (length: 256)
        public string Address2 { get; set; } // Address2 (length: 256)
        public string City { get; set; } // City (length: 256)
        public string Province { get; set; } // Province (length: 256)
        public string Country { get; set; } // Country (length: 256)
        public string PostalCode { get; set; } // PostalCode (length: 8)
        public string PostalAddress1 { get; set; } // PostalAddress1 (length: 256)
        public string PostalAddress2 { get; set; } // PostalAddress2 (length: 256)
        public string PostalCity { get; set; } // PostalCity (length: 256)
        public string PostalProvince { get; set; } // PostalProvince (length: 256)
        public string PostalCountry { get; set; } // PostalCountry (length: 256)
        public string PostalPostCode { get; set; } // PostalPostCode (length: 8)
        public string Telephone { get; set; } // Telephone (length: 24)
        public string Mobile { get; set; } // Mobile (length: 24)
        public string Email { get; set; } // Email (length: 128)
        public string PreferredCommunication { get; set; } // PreferredCommunication (length: 24)
        public string ProductOption { get; set; } // ProductOption (length: 128)
        public string AnnualIncreaseOption { get; set; } // AnnualIncreaseOption (length: 16)
        public string IncreaseMonth { get; set; } // IncreaseMonth (length: 16)
        public string Employer { get; set; } // Employer (length: 128)
        public string PersalNumber { get; set; } // PersalNumber (length: 32)
        public string Department { get; set; } // Department (length: 64)
        public string Bank { get; set; } // Bank (length: 64)
        public string BranchCode { get; set; } // BranchCode (length: 16)
        public string AccountNo { get; set; } // AccountNo (length: 32)
        public string AccountType { get; set; } // AccountType (length: 64)
        public string DebitOrderDay { get; set; } // DebitOrderDay (length: 8)
        public string RepIdNumber { get; set; } // RepIdNumber (length: 16)
        public string PolicyNumber { get; set; } // PolicyNumber (length: 32)
        public int? ExcelRowNumber { get; set; } // ExcelRowNumber
        public string PayrollCode { get; set; } // PayrollCode (length: 32)
        public string PaymentMethod { get; set; } // PaymentMethod (length: 64)

        public Load_ConsolidatedFuneral()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
