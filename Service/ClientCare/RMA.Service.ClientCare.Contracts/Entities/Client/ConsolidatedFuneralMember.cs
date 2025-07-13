using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class ConsolidatedFuneralMember
    {
        public int Id { get; set; }
        public System.Guid FileIdentifier { get; set; }
        public string ClientReference { get; set; }
        public System.DateTime? JoinDate { get; set; }
        public string CoverMemberType { get; set; }
        public int RolePlayerTypeId { get; set; }
        public IdTypeEnum IdType { get; set; }
        public string IdNumber { get; set; }
        public string MainMemberIdNumber { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public string MemberName { get; set; }
        public System.DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public int JoinAge { get; set; }
        public string Affordability { get; set; }
        public string ProductOption { get; set; }
        public string BenefitName { get; set; }
        public int? BrokerageId { get; set; }
        public int? RepresentativeId { get; set; }
        public string RepIdNumber { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public decimal PolicyPremium { get; set; }
        public decimal PolicyCover { get; set; }
        public decimal? ExistingCover { get; set; }
        public int Multiplier { get; set; }
        public int RolePlayerId { get; set; }
        public int MainMemberRolePlayerId { get; set; }
        public int ProductOptionId { get; set; }
        public int BenefitId { get; set; }
        public bool PolicyExists { get; set; }
        public bool RolePlayerExists { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string City { get; set; }
        public string Province { get; set; }
        public string Country { get; set; }
        public string PostalCode { get; set; }
        public string PostalAddress1 { get; set; }
        public string PostalAddress2 { get; set; }
        public string PostalCity { get; set; }
        public string PostalProvince { get; set; }
        public string PostalCountry { get; set; }
        public string PostalPostCode { get; set; }
        public string TelNo { get; set; }
        public string CellNo { get; set; }
        public string Email { get; set; }
        public int? PreferredCommunication { get; set; }
        public int? AnnualIncreaseType { get; set; }
        public int? AnnualIncreaseMonth { get; set; }
        public int? DebitOrderDay { get; set; }
        public string TestDateOfBirth { get; set; }
        public string TestJoinDate { get; set; }
        public PaymentMethodEnum? PaymentMethod { get; set; }
    }
}
