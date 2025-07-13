using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class InsuredLife : AuditDetails
    {
        public int InsuredLifeTypeId { get; set; }
        public string Name { get; set; } // Name (length: 50)
        public BeneficiaryTypeEnum? BeneficiaryType { get; set; } // BeneficiaryTypeId
        public string ReferenceNumber { get; set; } // ReferenceNumber (length: 255)
        public string Surname { get; set; } // Surname (length: 50)
        public string IdNumber { get; set; } // IdNumber (length: 50)
        public string PassportNumber { get; set; } // PassportNumber (length: 50)
        public System.DateTime DateOfBirth { get; set; } // DateOfBirth
        public System.DateTime? DateOfDeath { get; set; } // DateOfDeath
        //public string Designation { get; set; } // Designation (length: 50)
        public string Email { get; set; } // Email (length: 50)
        public string TelephoneNumber { get; set; } // TelephoneNumber (length: 50)
        public string MobileNumber { get; set; } // MobileNumber (length: 50)
        public bool? HasDisability { get; set; } // HasDisability
        public bool? IsStudying { get; set; } // IsStudying
        public int? CoverPercentage { get; set; }
        public string Status { get; set; }
        public string RelationshipName { get; set; }
        public int? ProductOptionCoverId { get; set; }
        public System.DateTime? CancellationDate { get; set; }
        public string Reason { get; set; }

        public bool CanEdit { get; set; }
        public bool CanAdd { get; set; }
        public bool CanRemove { get; set; }
        public DateTime DateViewed { get; set; }
    }
}