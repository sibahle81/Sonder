namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class UploadRatesSummary
    {
        public double Total { get; set; }
        public double TotalUploaded { get; set; }
        public double TotalSkipped { get; set; }
        public int ValidationCount { get; set; }
        public string FileIdentifier { get; set; }
    }
}
