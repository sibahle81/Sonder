using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class HealthCareProviderModel
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string Name { get; set; } // Name (length: 80)
        public string Description { get; set; } // Description (length: 2048)
        public string PracticeNumber { get; set; } // PracticeNumber (length: 50)
        public System.DateTime? DatePracticeStarted { get; set; } // DatePracticeStarted
        public System.DateTime? DatePracticeClosed { get; set; } // DatePracticeClosed
        public int ProviderTypeId { get; set; } // ProviderTypeId
        public bool IsVat { get; set; } // IsVat
        public string VatRegNumber { get; set; } // VATRegNumber (length: 50)
        public int? ConsultingPartnerType { get; set; } // ConsultingPartnerType
        public bool IsPreferred { get; set; } // IsPreferred
        public bool IsMedInvTreatmentInfoProvided { get; set; } // IsMedInvTreatmentInfoProvided
        public bool IsMedInvInjuryInfoProvided { get; set; } // IsMedInvInjuryInfoProvided
        public bool IsMineHospital { get; set; } // IsMineHospital
        public bool IsNeedTreatments { get; set; } // IsNeedTreatments
        public int? ArmType { get; set; } // ArmType
        public string ArmCode { get; set; } // ArmCode (length: 12)
        public int FinSystemSynchStatusId { get; set; } // FinSystemSynchStatusId
        public int HealthCareProviderGroupId { get; set; } // HealthCareProviderGroupId
        public string DispensingLicenseNo { get; set; } // DispensingLicenseNo (length: 50)
        public int? AcuteMedicalAuthNeededTypeId { get; set; } // AcuteMedicalAuthNeededTypeId
        public int? ChronicMedicalAuthNeededTypeId { get; set; } // ChronicMedicalAuthNeededTypeId
        public bool IsAllowSameDayTreatment { get; set; } // IsAllowSameDayTreatment
        public System.DateTime? AgreementEndDate { get; set; } // AgreementEndDate
        public System.DateTime? AgreementStartDate { get; set; } // AgreementStartDate
        public bool? IsAuthorised { get; set; } // IsAuthorised
        public byte? AgreementType { get; set; } // AgreementType
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string Hash { get; set; } // Hash (length: 66)
        public bool IsExcludeAutoPay { get; set; } // IsExcludeAutoPay
    }
}
