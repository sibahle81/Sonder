using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Entities
{
    public class UserRegistrationDetails
    {
        public int UserDetailsId { get; set; }
        public string SaId { get; set; }
        public string PassportNo { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public DateTime DateOfBirth { get; set; }
        public UserProfileTypeEnum UserProfileType { get; set; }
        public IdTypeEnum IdTypeEnum { get; set; }
        public string CompanyRegistrationNumber { get; set; }
        public int HealthCareProviderId { get; set; }
        public string BrokerFspNumber { get; set; }

        public UserAddress UserAddress { get; set; }
        public UserContact UserContact { get; set; }
        public bool IsVopdPassed { get; set; }
        public DateTime? PassportExpiryDate { get; set; }
    }
}