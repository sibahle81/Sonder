namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class ICD10CodeMatch
    {
        public string ICD10Code { get; set; }
        public bool IsClinicalCode { get; set; }
        public bool IsCauseCode { get; set; }
        public bool IsValid { get; set; }
        public string Description { get; set; }
    }
}
