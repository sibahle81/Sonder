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

namespace RMA.Service.Billing.Database.Entities
{
    public partial class client_PersonTemp : IAuditableEntity, ISoftDeleteEntity
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string FirstName { get; set; } // FirstName (Primary key) (length: 50)
        public string Surname { get; set; } // Surname (Primary key) (length: 50)
        public IdTypeEnum IdType { get; set; } // IdTypeId (Primary key)
        public string IdNumber { get; set; } // IdNumber (Primary key) (length: 50)
        public System.DateTime DateOfBirth { get; set; } // DateOfBirth (Primary key)
        public bool IsAlive { get; set; } // IsAlive (Primary key)
        public System.DateTime? DateOfDeath { get; set; } // DateOfDeath
        public string DeathCertificateNumber { get; set; } // DeathCertificateNumber (length: 50)
        public bool IsVopdVerified { get; set; } // IsVopdVerified (Primary key)
        public System.DateTime? DateVopdVerified { get; set; } // DateVopdVerified
        public bool IsStudying { get; set; } // IsStudying (Primary key)
        public bool IsDisabled { get; set; } // IsDisabled (Primary key)
        public GenderEnum? Gender { get; set; } // GenderId
        public MaritalStatusEnum? MaritalStatus { get; set; } // MaritalStatusId
        public NationalityEnum? Nationality { get; set; } // NationalityId
        public int? CountryOriginId { get; set; } // CountryOriginId
        public TitleEnum? Title { get; set; } // TitleId
        public bool IsDeleted { get; set; } // IsDeleted (Primary key)
        public string CreatedBy { get; set; } // CreatedBy (Primary key) (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate (Primary key)
        public string ModifiedBy { get; set; } // ModifiedBy (Primary key) (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate (Primary key)
        public LanguageEnum? Language { get; set; } // LanguageId
        public int? ProvinceId { get; set; } // ProvinceId
        public string PopulationGroup { get; set; } // PopulationGroup (length: 50)
        public System.DateTime? MarriageDate { get; set; } // MarriageDate
        public MarriageTypeEnum? MarriageType { get; set; } // MarriageTypeId
        public int? TebaLocationId { get; set; } // TebaLocationID
        public string Initials { get; set; } // Initials (length: 10)
        public string TaxNumber { get; set; } // TaxNumber (length: 50)

        public client_PersonTemp()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
