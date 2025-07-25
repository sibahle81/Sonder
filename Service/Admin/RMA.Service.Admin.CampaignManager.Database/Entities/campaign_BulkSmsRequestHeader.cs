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

namespace RMA.Service.Admin.CampaignManager.Database.Entities
{
    public partial class campaign_BulkSmsRequestHeader : IAuditableEntity, ISoftDeleteEntity
    {
        public int BulkSmsRequestHeaderId { get; set; } // BulkSmsRequestHeaderId (Primary key)
        public int Department { get; set; } // Department
        public string Campaign { get; set; } // Campaign (length: 100)
        public SmsStatusEnum SmsStatus { get; set; } // SmsStatusId
        public System.DateTime WhenToSend { get; set; } // WhenToSend
        public string ProgressStatus { get; set; } // ProgressStatus (length: 500)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Reverse navigation

        /// <summary>
        /// Child campaign_BulkSmsRequestDetails where [BulkSmsRequestDetail].[BulkSmsRequestHeaderId] point to this entity (FK_BulkSmsRequestDetail_BulkSmsRequestHeaderId)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<campaign_BulkSmsRequestDetail> BulkSmsRequestDetails { get; set; } // BulkSmsRequestDetail.FK_BulkSmsRequestDetail_BulkSmsRequestHeaderId

        public campaign_BulkSmsRequestHeader()
        {
            SmsStatus = SmsStatusEnum.Pending;
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            BulkSmsRequestDetails = new System.Collections.Generic.List<campaign_BulkSmsRequestDetail>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
