using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class EmailInfo
    {
        public string Email { get; set; }
        public string Domain { get; set; }
        public bool IsValidEmailFormat { get; set; }
        public bool IsValidDomainFormat { get; set; }
        public bool WasDomainLookupPerformed { get; set; }
        public bool DomainNameResolved { get; set; }
    }
}
