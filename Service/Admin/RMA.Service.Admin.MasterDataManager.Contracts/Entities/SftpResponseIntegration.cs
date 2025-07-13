using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SftpResponseIntegration
    {
        public int Status { get; set; } // 200 or 400
        public string Message { get; set; } // Received
    }
}
