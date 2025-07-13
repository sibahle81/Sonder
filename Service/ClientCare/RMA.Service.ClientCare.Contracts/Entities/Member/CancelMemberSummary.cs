namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class CancelMemberSummary
    {
        public double Total { get; set; }
        public double TotalCancelled { get; set; }
        public double TotalSkipped { get; set; }
    }
}
