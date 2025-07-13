using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SftpRequestTypeConnection
    {
        public int SftpRequestTypeConnectionId { get; set; }
        public SftpRequestTypeEnum SftpRequestType { get; set; }
        public string ConnectionSite { get; set; }
        public string ConnectionUser { get; set; }
        public string ConnectionPass { get; set; }
        public string TargetLocation { get; set; }
        public bool IsDeleted { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
    }
}
