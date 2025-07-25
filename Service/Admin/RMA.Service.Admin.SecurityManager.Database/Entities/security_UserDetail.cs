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
using RMA.Service.Admin.SecurityManager.Contracts.Enums;

namespace RMA.Service.Admin.SecurityManager.Database.Entities
{
    public partial class security_UserDetail : IAuditableEntity, ISoftDeleteEntity, IEntityStatus
    {
        public int UserDetailsId { get; set; } // UserDetailsId (Primary key)
        public int UserId { get; set; } // UserId
        public string SaId { get; set; } // SAId (length: 13)
        public string PassportNo { get; set; } // PassportNo (length: 20)
        public System.DateTime? PassportExpiryDate { get; set; } // PassportExpiryDate
        public string Name { get; set; } // Name (length: 50)
        public string Surname { get; set; } // Surname (length: 50)
        public System.DateTime? DateofBirth { get; set; } // DateofBirth
        public int UserAddressId { get; set; } // UserAddressId
        public int UserContactId { get; set; } // UserContactId
        public UserProfileTypeEnum UserProfileType { get; set; } // UserProfileTypeId
        public int UserActivationId { get; set; } // UserActivationId
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent security_User pointed by [UserDetails].([UserId]) (FK_UserDetails_User)
        /// </summary>
        public virtual security_User User { get; set; } // FK_UserDetails_User

        /// <summary>
        /// Parent security_UserActivation pointed by [UserDetails].([UserActivationId]) (FK_UserDetails_UserActivation)
        /// </summary>
        public virtual security_UserActivation UserActivation { get; set; } // FK_UserDetails_UserActivation

        public security_UserDetail()
        {
            IsActive = true;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
