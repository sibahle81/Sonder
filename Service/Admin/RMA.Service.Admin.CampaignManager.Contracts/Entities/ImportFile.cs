using RMA.Common.Entities;

using System;

namespace RMA.Service.Admin.CampaignManager.Contracts.Entities
{
    public class ImportFile : AuditDetails
    {
        public int CampaignId { get; set; }
        public Guid FileToken { get; set; }
        public int RecordCount { get; set; }
        public int ProcessedCount { get; set; }
        public int RetryCount { get; set; }
        public string Status { get; set; }
        public string LastError { get; set; }
    }
}