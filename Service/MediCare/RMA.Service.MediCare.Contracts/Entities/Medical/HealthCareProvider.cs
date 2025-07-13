
using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class HealthCareProvider : AuditDetails
    {
        public int RolePlayerId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PracticeNumber { get; set; }
        public System.DateTime? DatePracticeStarted { get; set; }
        public System.DateTime? DatePracticeClosed { get; set; }
        public int ProviderTypeId { get; set; }
        public string PractitionerTypeName { get; set; }
        public bool IsVat { get; set; }
        public string VatRegNumber { get; set; }
        public int? ConsultingPartnerType { get; set; }
        public bool IsPreferred { get; set; }
        public bool IsMedInvTreatmentInfoProvided { get; set; }
        public bool IsMedInvInjuryInfoProvided { get; set; }
        public bool IsMineHospital { get; set; }
        public bool IsNeedTreatments { get; set; }
        public int? ArmType { get; set; }
        public string ArmCode { get; set; }
        public int FinSystemSynchStatusId { get; set; }
        public int HealthCareProviderGroupId { get; set; }
        public string DispensingLicenseNo { get; set; }
        public int? AcuteMedicalAuthNeededTypeId { get; set; }
        public int? ChronicMedicalAuthNeededTypeId { get; set; }
        public bool IsAllowSameDayTreatment { get; set; }
        public System.DateTime? AgreementEndDate { get; set; }
        public System.DateTime? AgreementStartDate { get; set; }
        public bool? IsAuthorised { get; set; }
        public byte? AgreementType { get; set; }
        public bool IsExcludeAutoPay { get; set; }
        public bool? IsJvPartner { get; set; }
        public bool? IsHospital { get; set; }
    }
}
