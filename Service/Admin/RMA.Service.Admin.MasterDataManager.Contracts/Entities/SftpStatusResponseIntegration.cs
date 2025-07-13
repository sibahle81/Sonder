using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SftpStatusResponseIntegration
    {
        public string RequestStatus { get; set; } // Always populated
        public string ErrorMessage { get; set; } // Populated for error
        public string ResponseFileName { get; set; } // Populated with response file - if one is received
        public DateTime? ResponseDate { get; set; } // Date response file received
    }
}
