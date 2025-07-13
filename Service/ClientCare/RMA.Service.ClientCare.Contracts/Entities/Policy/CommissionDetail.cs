using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CommissionDetail
    {
        public int Id { get; set; }
        public int CommissionSummaryId { get; set; }
        public int PolicyId { get; set; }
        public string PolicyNumber { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public string ClientReference { get; set; }
        public int BrokerId { get; set; }
        public string BrokerName { get; set; }
        public System.DateTime JoinDate { get; set; }
        public string PaidForMonth { get; set; }
        public decimal Premium { get; set; }
        public decimal CommissionPercentage { get; set; }
        public decimal CommissionAmount { get; set; }
        public decimal RetentionPercentage { get; set; }
        public decimal RetentionAmount { get; set; }
        public decimal? Clawback { get; set; }
        public DateTime? ExportDate { get; set; }
        public bool? IsSubmitted { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}