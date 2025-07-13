using System;
using RMA.Common.Enums;

namespace RMA.Service.ScanCare.Contracts.Entities.AutoProcessing
{
    public class MailboxConfiguration
    {
        public int Id { get; set; } // Id
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 256)
        public DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 256)
        public DateTime ModifiedDate { get; set; } // ModifiedDate
        public string MailboxAddress { get; set; } // MailboxAddress (length: 256)
        public DocumentSystemNameEnum DocumentSystemName { get; set; } // DocumentSystemName
    }
}
