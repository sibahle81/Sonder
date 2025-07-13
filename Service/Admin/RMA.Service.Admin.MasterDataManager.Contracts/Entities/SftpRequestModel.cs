using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public  class SftpRequestModel
    {
        public SftpRequest SftpRequestHeader { get; set; }
        public List<SftpRequestItem> SftpRequestLineItems { get; set; }
    }
}
