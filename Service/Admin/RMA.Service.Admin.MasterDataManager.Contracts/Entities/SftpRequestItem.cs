using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SftpRequestItem
    {
        public int SftpRequestItemId { get; set; }
        public int SftpRequestId { get; set; }
        public int LinkedItemId { get; set; }
        public System.DateTime RequestedDate { get; set; }
        public System.DateTime? ResponseDate { get; set; }
        public bool IsDeleted { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string ModifiedBy { get; set; } 
    }
}
