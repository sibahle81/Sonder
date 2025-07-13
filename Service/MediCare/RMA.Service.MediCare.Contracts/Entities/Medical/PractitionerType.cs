using RMA.Common.Entities;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class PractitionerType : AuditDetails
    {
        public int PractitionerTypeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PracticeTypeCode { get; set; }
        public int MaximumTreatmentDays { get; set; }
        public string Groupings { get; set; }
        public string NrplPracticeType { get; set; }
        public bool IsGp { get; set; }
        public bool IsHospital { get; set; }
        public bool IsDentist { get; set; }
        public bool IsAmbulance { get; set; }
        public bool IsSpecialist { get; set; }
        public bool IsAnaesthetist { get; set; }
        public bool? IsRequireMedicalReport { get; set; }
    }
}
