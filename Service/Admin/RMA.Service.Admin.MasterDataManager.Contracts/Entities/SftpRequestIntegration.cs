using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SftpRequestIntegration
    {
        public string RequestFileName { get; set; } // Azure Blob Storage
        public int RequestTypeId { get; set; } // Previously registered
        public int SourceRequestId { get; set; } // Source system requestID
    }
}
