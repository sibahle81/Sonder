using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class UserDetails : AuditDetails
    {
        public UserDetails()
        {
            UserActivation = new UserActivation();
            UserContact = new UserContact();
        }

        public int UserDetailsId { get; set; } // UserDetailsId (Primary key)
        public string SaId { get; set; } // SAId (length: 13)
        public string PassportNo { get; set; } // PassportNo (length: 20)
        public string Name { get; set; } // Name (length: 50)
        public string Surname { get; set; } // Surname (length: 50)
        public System.DateTime? DateofBirth { get; set; } // DateofBirth
        public int UserAddressId { get; set; } // UserAddressId
        public int UserContactId { get; set; } // UserContactId
        public UserProfileTypeEnum UserProfileType { get; set; } // UserProfileType
        public IdTypeEnum IdTypeEnum { get; set; }
        public string CompanyRegistrationNumber { get; set; }
        public int HealthCareProviderId { get; set; }
        public string BrokerFspNumber { get; set; }
        public bool IsInternalUser { get; set; }

        public UserAddress UserAddress { get; set; }
        public UserContact UserContact { get; set; }
        public UserActivation UserActivation { get; set; }

        public string Password { get; set; }
        public bool UserExistInActivationTable { get; set; }
        public bool IsVopdPassed { get; set; }
        public bool UserActivationLinkIsActive { get; set; }
        public string UserActivationMessage { get; set; }
        public int UserId { get; set; }
        public DateTime? PassportExpiryDate { get; set; }
        public int BrokerageId { get; set; }
        public int RolePlayerId { get; set; }
        public int RoleId { get; set; }
        public PortalTypeEnum PortalType { get; set; }
        public string RoleName { get; set; }

        public int UserProfileTypeId
        {
            get => (int)UserProfileType;
            set => UserProfileType = (UserProfileTypeEnum)value;
        }
    }
}