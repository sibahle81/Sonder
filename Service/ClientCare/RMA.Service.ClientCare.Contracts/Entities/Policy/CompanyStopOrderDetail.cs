using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CompanyStopOrderDetail
    {
        public int? PolicyId { get; set; }
        public string CompanyName { get; set; }
        public DateTime? Month { get; set; }
        public string PersalNumber { get; set; }
        public string IdNumber { get; set; }
        public string MemberName { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime? InceptionDate { get; set; }
        public string PolicyStatus { get; set; }
        public decimal? Premium { get; set; }
    }
}
