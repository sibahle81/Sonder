using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class InsuredLifeResult : AuditDetails
    {
        public string Name { get; set; } // Name (length: 50)
        public BeneficiaryTypeEnum? BeneficiaryType { get; set; } // BeneficiaryTypeId
        public string ReferenceNumber { get; set; } // ReferenceNumber (length: 255)
        public string Surname { get; set; } // Surname (length: 50)
        public string IdNumber { get; set; } // IdNumber (length: 50)
        public string PassportNumber { get; set; } // PassportNumber (length: 50)
        public DateTime DateOfBirth { get; set; } // DateOfBirth
        public DateTime? DateOfDeath { get; set; } // DateOfDeath
        public string Designation { get; set; } // Designation (length: 50)
        public string Email { get; set; } // Email (length: 50)
        public string TelephoneNumber { get; set; } // TelephoneNumber (length: 50)
        public string MobileNumber { get; set; } // MobileNumber (length: 50)
        public bool? HasDisability { get; set; } // HasDisability
        public bool? IsStudying { get; set; } // IsStudying

        //ENUM => ID Conversions
        public int? BeneficiaryTypeId
        {
            get => (int)BeneficiaryType;
            set => BeneficiaryType = (BeneficiaryTypeEnum)value;
        }
    }
}