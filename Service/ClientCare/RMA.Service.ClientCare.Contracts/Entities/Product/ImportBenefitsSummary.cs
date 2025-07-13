namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class ImportBenefitsSummary
    {
        public int NewBenefits { get; set; }
        public int TotalBenefits { get; set; }
        public int TotalUploaded { get; set; }
        public int TotalFailed { get; set; }
        public int ErrorAuditCount { get; set; }
    }
}
