namespace RMA.Service.ClientCare.Contracts.Entities.Lead
{
    public class ImportLeadsSummary
    {
        public int NewLeads { get; set; }
        public int TotalLeads { get; set; }
        public int TotalUploaded { get; set; }
        public int TotalFailed { get; set; }
    }
}
