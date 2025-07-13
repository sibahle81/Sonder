namespace RMA.Service.Integrations.Contracts.Entities.CompCare
{
    public class CCClaimRequest
    {
        public string claimReferenceNo { get; set; }
        public string sourceSystemReference { get; set; }
        public string sourceSystemRoutingID { get; set; }
        public int MedicalReportSystemSourceId { get; set; }
    }

    public class RootCCClaimRequest
    {
        public CCClaimRequest request { get; set; }
    }

}
