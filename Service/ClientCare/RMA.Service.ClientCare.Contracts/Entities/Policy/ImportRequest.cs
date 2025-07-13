using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class ImportRequest
    {
        public ImportTypeEnum ImportType { get; set; }
        public Uri ImportUri { get; set; }
        public Guid ImportReference { get; set; }
        public bool IsImportApproved { get; set; }
    }
}