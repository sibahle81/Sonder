using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class MedicalServiceProvider
    {
        public int RolePlayerId { get; set; } // RolePlayerId (Primary key)
        public string Name { get; set; } // Name (length: 255)
        public string Description { get; set; }
        public string ContactNumber { get; set; }
        public string PracticeNo { get; set; } // PracticeNo (length: 50)
        public System.DateTime DatePracticeStarted { get; set; } // DatePracticeStarted
        public System.DateTime? DatePracticeClosed { get; set; } // DatePracticeClosed
        public PractitionerTypeEnum PractitionerType { get; set; } // PractitionerTypeId
        public string VatRegistrationNo { get; set; } // VatRegistrationNo (length: 50)
        public int? ConsultingPartnerTypeId { get; set; } // ConsultingPartnerTypeId
        public string PracticeDiscipline { get; set; } // PracticeDiscipline (length: 50)
        public string PracticeSubDiscipline { get; set; } // PracticeSubDiscipline (length: 50)
        public string ProviderDiscipline { get; set; } // ProviderDiscipline (length: 50)
        public string ProviderSubDiscipline { get; set; } // ProviderSubDiscipline (length: 50)
        public bool IsPreferred { get; set; } // IsPreferred
        public bool IsMedInvoiceTreatmentInfoProvided { get; set; } // IsMedInvoiceTreatmentInfoProvided
        public bool IsMedInvoiceInjuryInfoProvided { get; set; } // IsMedInvoiceInjuryInfoProvided
        public string DispensingLicenseNo { get; set; } // DispensingLicenseNo (length: 50)
        public bool AllowSameDayTreatment { get; set; } // AllowSameDayTreatment
        public bool IsAuthorised { get; set; } // IsAuthorised
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public string LastName { get; set; }

        public int PractitionerTypeId
        {
            get => (int)PractitionerType;
            set => PractitionerType = (PractitionerTypeEnum)value;
        }

    }
}