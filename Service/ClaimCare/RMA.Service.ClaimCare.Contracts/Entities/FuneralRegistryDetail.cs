using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class FuneralRegistryDetail
    {
        public int Id { get; set; } // Id (Primary key)
        public int? ClaimId { get; set; } // ClaimId
        public string UniqueClaimReferenceNumber { get; set; } // UniqueClaimReferenceNumber (length: 50)
        public int? InsuredLifeId { get; set; } // InsuredLifeId
        public int? WizardId { get; set; } // WizardId
        public int? PolicyId { get; set; } // PolicyId
        public string IdNumber { get; set; } // IdNumber (length: 50)
        public string Passport { get; set; } // Passport (length: 50)
        public string CauseOfDeathId { get; set; }
        public string FirstName { get; set; } // FirstName (length: 250)
        public string LastName { get; set; } // LastName (length: 250)
        public DeathTypeEnum? DeathType { get; set; } // DeathTypeEnum
        public System.DateTime? DateOfDeath { get; set; } // DateOfDeath
        public bool? IsStillborn { get; set; } // IsStillborn
        public string Email { get; set; } // Email (length: 250)
        public string DhaReferenceNumber { get; set; } // DhaReferenceNumber (length: 50)
        public string DeathCertificateReferenceNumber { get; set; } // DeathCertificateReferenceNumber (length: 50)
        public string HomeAffairsRegion { get; set; } // HomeAffairsRegion (length: 50)
        public string PlaceOfDeath { get; set; } // PlaceOfDeath (length: 50)
        public string PlaceEventOccured { get; set; } // PlaceEventOccured (length: 250)
        public string NationalityOfDeceased { get; set; } // NationalityOfDeceased (length: 250)
        public bool? InterviewWithFamilyMember { get; set; } // InterviewWithFamilyMember
        public bool? OpinionOfMedicalPractitioner { get; set; } // OpinionOfMedicalPractitioner
        public System.DateTime? DateOfBirth { get; set; } // DateOfBirth
        public int? GenderId { get; set; } // GenderId
        public int? GestationPeriod { get; set; } // GestationPeriod
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        //ENUM => ID Conversions
        public int? DeathTypeId
        {
            get => (int)DeathType;
            set => DeathType = (DeathTypeEnum)value;
        }
    }
}
