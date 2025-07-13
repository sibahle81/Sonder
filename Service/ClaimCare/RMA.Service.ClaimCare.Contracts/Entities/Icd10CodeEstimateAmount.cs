
namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Icd10CodeEstimateAmount
    {
        public int Icd10CodeEstimateLookupId { get; set; }
        public string Icd10Code { get; set; }
        public int ICD10DiagnosticGroupId { get; set; }
        public decimal MedicalMinimumCost { get; set; }
        public decimal MedicalAverageCost { get; set; }
        public decimal MedicalMaximumCost { get; set; }
        public decimal PDExtentMinimum { get; set; }
        public decimal PDExtentAverage { get; set; }
        public decimal PDExtentMaximum { get; set; }
        public decimal DaysOffMinimum { get; set; }
        public decimal DaysOffAverage { get; set; }
        public decimal DaysOffMaximum { get; set; }

    }
}