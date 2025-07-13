using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class Person
    {
        public int RolePlayerId { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public IdTypeEnum IdType { get; set; }
        public string IdNumber { get; set; }
        public string PassportNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public bool IsAlive { get; set; }
        public bool IsStudying { get; set; }
        public bool IsDisabled { get; set; }
        public bool IsBeneficiary { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public string DeathCertificateNumber { get; set; }
        public bool IsVopdVerified { get; set; }
        public DateTime? DateVopdVerified { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public GenderEnum? Gender { get; set; } // GenderId
        public MaritalStatusEnum? MaritalStatus { get; set; } // MaritalStatusId
        public NationalityEnum? Nationality { get; set; } // NationalityId
        public int? CountryOriginId { get; set; } // CountryOriginId
        public TitleEnum? Title { get; set; } // TitleId
        public LanguageEnum? Language { get; set; } // Language
        public int? ProvinceId { get; set; } // ProvinceId
        public string PopulationGroup { get; set; } // PopulationGroup
        public MarriageTypeEnum? MarriageType { get; set; } // MarriageType
        public System.DateTime? MarriageDate { get; set; } // MarriageDate
        public string Initials { get; set; } // Initials (length: 10)
        public string TaxNumber { get; set; } // TaxNumber (length: 50)

        public List<PersonEmployment> PersonEmployments { get; set; }

        public int Age { get => GetAge(); }

        private int GetAge()
        {
            var today = DateTime.Today;
            int age = today.Year - DateOfBirth.Year;
            if (today.Month < DateOfBirth.Month || (today.Month == DateOfBirth.Month && today.Day < DateOfBirth.Day))
                age--;
            return age;
        }
    }
}