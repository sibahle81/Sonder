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

namespace RMA.Service.ScanCare.Database.Entities
{
    public partial class documents_DocumentKey : IAuditableEntity, ISoftDeleteEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public int DocumentId { get; set; } // DocumentId
        public string KeyName { get; set; } // KeyName (length: 50)
        public string KeyValue { get; set; } // KeyValue (length: 50)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        // Foreign keys

        /// <summary>
        /// Parent documents_Document pointed by [DocumentKeys].([DocumentId]) (FK_DocumentKeys_Document)
        /// </summary>
        public virtual documents_Document Document { get; set; } // FK_DocumentKeys_Document

        public documents_DocumentKey()
        {
            CreatedDate = System.DateTime.Now;
            ModifiedDate = System.DateTime.Now;
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
