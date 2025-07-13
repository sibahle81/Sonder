using System;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class OwnerUpload
    {
        public int Id { get; set; } // Id (Primary key)
        public int UploadId { get; set; } // UploadId
        public int OwnerId { get; set; } // OwnerId
        public string OwnerType { get; set; } // OwnerType (length: 50)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate

        //Not On Database
        public string Name { get; set; }
        public string DocumentType { get; set; }

        public Guid Token { get; set; }
        //Name = ownerUpload.Upload.Name,
        //DocumentType = ownerUpload.Upload.MimeType,
        //Token = ownerUpload.Upload.Token,
    }
}