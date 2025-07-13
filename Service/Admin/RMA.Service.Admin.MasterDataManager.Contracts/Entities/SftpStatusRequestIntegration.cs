using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SftpStatusRequestIntegration
    {
        public int RequestTypeId { get; set; }
        public int SourceRequestId { get; set; }
    }
}
