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

namespace RMA.Service.Billing.Database.Entities
{
    public partial class Load_RatesUploadErrorAudit : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public string FileIdentifier { get; set; } // FileIdentifier (length: 50)
        public string FileName { get; set; } // FileName (length: 50)
        public string ErrorCategory { get; set; } // ErrorCategory (length: 50)
        public string ErrorMessage { get; set; } // ErrorMessage (length: 256)
        public string ExcelRowNumber { get; set; } // ExcelRowNumber (length: 50)
        public System.DateTime UploadDate { get; set; } // UploadDate

        public Load_RatesUploadErrorAudit()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
