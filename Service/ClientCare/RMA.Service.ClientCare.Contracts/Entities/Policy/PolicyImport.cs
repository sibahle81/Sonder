using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyImport : AuditDetails
    {
        public ImportTypeEnum ImportType { get; set; }
        public Guid FileRefToken { get; set; }
        public string Status { get; set; }
        public int RecordCount { get; set; }
        public int ProcessedCount { get; set; }
        public int RetryCount { get; set; }
        public string LastError { get; set; }
    }
}