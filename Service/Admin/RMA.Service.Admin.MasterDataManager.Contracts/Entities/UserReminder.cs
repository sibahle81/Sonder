
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class UserReminder
    {
        public int UserReminderId { get; set; } // UserReminderId (Primary key)
        public UserReminderTypeEnum UserReminderType { get; set; } // UserReminderTypeId
        public UserReminderItemTypeEnum? UserReminderItemType { get; set; } // UserReminderItemTypeId
        public int? ItemId { get; set; } // ItemId
        public string Text { get; set; } // Text (length: 250)
        public int? AssignedByUserId { get; set; } // AssignedByUserId
        public int? AssignedToUserId { get; set; } // AssignedToUserId
        public System.DateTime? AlertDateTime { get; set; } // AlertDateTime
        public string LinkUrl { get; set; }
        public bool IsDeleted { get; set; } // isDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}