//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Enums;

namespace RMA.Service.Admin.SecurityManager.Database.Entities
{
    public partial class security_LoginHistory : ILazyLoadSafeEntity
    {
        public int LoginHistoryId { get; set; } // LoginHistoryId (Primary key)
        public System.DateTime Logged { get; set; } // Logged
        public string RemoteIpAddress { get; set; } // RemoteIpAddress (length: 20)
        public string Username { get; set; } // Username (length: 50)
        public string State { get; set; } // State (length: 100)
        public string Reason { get; set; } // Reason (length: 100)

        public security_LoginHistory()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
