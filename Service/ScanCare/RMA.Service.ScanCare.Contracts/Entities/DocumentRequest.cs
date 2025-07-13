using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ScanCare.Contracts.Entities
{
    public class DocumentRequest
    {
        public DocumentSetEnum DocumentSet { get; set; }
        public string system { get; set; }
        public Dictionary<string, string> Keys { get; set; }

        public int DocumentSetId
        {
            get => (int)DocumentSet;
            set => DocumentSet = (DocumentSetEnum)value;
        }
    }
}
