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
    public partial class Load_MyValuePlusMember : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public System.Guid FileIdentifier { get; set; } // FileIdentifier
        public string ClientReference { get; set; } // ClientReference (length: 64)
        public System.DateTime? JoinDate { get; set; } // JoinDate
        public CoverMemberTypeEnum CoverMemberType { get; set; } // CoverMemberTypeId
        public int RolePlayerTypeId { get; set; } // RolePlayerTypeId
        public IdTypeEnum IdType { get; set; } // IdTypeId
        public string IdNumber { get; set; } // IdNumber (length: 64)
        public string MainMemberIdNumber { get; set; } // MainMemberIdNumber (length: 32)
        public string FirstName { get; set; } // FirstName (length: 64)
        public string Surname { get; set; } // Surname (length: 64)
        public string MemberName { get; set; } // MemberName (length: 128)
        public System.DateTime? DateOfBirth { get; set; } // DateOfBirth
        public string Gender { get; set; } // Gender (length: 16)
        public int Age { get; set; } // Age
        public int JoinAge { get; set; } // JoinAge
        public string Affordability { get; set; } // Affordability (length: 32)
        public string ProductOption { get; set; } // ProductOption (length: 128)
        public string BenefitName { get; set; } // BenefitName (length: 128)
        public string BenefitNameOriginal { get; set; } // BenefitName_Original (length: 128)
        public int? BrokerageId { get; set; } // BrokerageId
        public int? RepresentativeId { get; set; } // RepresentativeId
        public string RepIdNumber { get; set; } // RepIdNumber (length: 16)
        public int PolicyId { get; set; } // PolicyId
        public string PolicyNumber { get; set; } // PolicyNumber (length: 32)
        public decimal PolicyPremium { get; set; } // PolicyPremium
        public decimal CoverAmount { get; set; } // CoverAmount
        public decimal? ExistingCover { get; set; } // ExistingCover
        public int Multiplier { get; set; } // Multiplier
        public int RolePlayerId { get; set; } // RolePlayerId
        public int MainMemberRolePlayerId { get; set; } // MainMemberRolePlayerId
        public int ProductOptionId { get; set; } // ProductOptionId
        public int BenefitId { get; set; } // BenefitId
        public bool PolicyExists { get; set; } // PolicyExists
        public bool RolePlayerExists { get; set; } // RolePlayerExists
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
        public string TelNo { get; set; } // TelNo (length: 32)
        public string CelNo { get; set; } // CelNo (length: 32)
        public string Email { get; set; } // Email (length: 128)
        public int? PreferredCommunication { get; set; } // PreferredCommunication
        public int? AnnualIncreaseType { get; set; } // AnnualIncreaseType
        public int? AnnualIncreaseMonth { get; set; } // AnnualIncreaseMonth
        public int? DebitOrderDay { get; set; } // DebitOrderDay
        public string TestDateOfBirth { get; set; } // TestDateOfBirth (length: 24)
        public string TestJoinDate { get; set; } // TestJoinDate (length: 24)
        public PaymentMethodEnum? PaymentMethod { get; set; } // PaymentMethodId
        public string PremiumWaiver { get; set; } // PremiumWaiver (length: 64)
        public string VaPsOptions { get; set; } // VAPsOptions (length: 64)
        public string LifeBenefitSplit { get; set; } // LifeBenefitSplit (length: 64)
        public string FuneralBenefitSplit { get; set; } // FuneralBenefitSplit (length: 64)

        public Load_MyValuePlusMember()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
