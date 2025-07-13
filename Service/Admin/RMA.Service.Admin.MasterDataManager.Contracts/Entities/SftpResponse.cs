using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class SftpResponse
    {
        public int SftpResponseId { get; set; }
        public int SftpRequestId { get; set; }
        public string FileName { get; set; }
        public System.DateTime? ResponseDate { get; set; }
        public int? ItemsInResponse { get; set; }
        public bool IsDeleted { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public string ErrorMessage { get; set; }
    }
}
