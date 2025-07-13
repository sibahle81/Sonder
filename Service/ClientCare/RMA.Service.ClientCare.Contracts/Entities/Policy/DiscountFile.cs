using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class DiscountFile
    {
        public int Id { get; set; } // Id (Primary key)
        public Guid FileIdentifier { get; set; } // FileIdentifier
        public string FileName { get; set; } // FileName (length: 100)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
