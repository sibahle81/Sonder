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
using System;

namespace RMA.Service.Billing.Database.Entities
{
    public partial class client_StopOrderCompany : IAuditableEntity, ISoftDeleteEntity
    {
        public int StopOrderCompanyId { get; set; } // StopOrderCompanyId (Primary key)
        public string CompanyCode { get; set; } // CompanyCode (length: 8)
        public string CompanyName { get; set; } // CompanyName (length: 128)
        public string Report { get; set; } // Report (length: 128)
        public StopOrderExportTypeEnum StopOrderExportType { get; set; } // StopOrderExportTypeId
        public string Recipient { get; set; } // Recipient (length: 512)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime? CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime? ModifiedDate { get; set; } // ModifiedDate

        // Reverse navigation

        /// <summary>
        /// Child client_StopOrderDates where [StopOrderDate].[StopOrderCompanyId] point to this entity (FK_StopOrderCutoffDate_StopOrderCompanyId)
        /// </summary>
        public virtual System.Collections.Generic.ICollection<client_StopOrderDate> StopOrderDates { get; set; } // StopOrderDate.FK_StopOrderCutoffDate_StopOrderCompanyId
        DateTime IAuditableEntity.CreatedDate { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        DateTime IAuditableEntity.ModifiedDate { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        public client_StopOrderCompany()
        {
            IsDeleted = false;
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            StopOrderDates = new System.Collections.Generic.List<client_StopOrderDate>();
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
