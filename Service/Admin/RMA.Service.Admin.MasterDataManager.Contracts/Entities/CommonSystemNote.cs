
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class CommonSystemNote
    {
        public int Id { get; set; } // Id (Primary key)
        public int ItemId { get; set; } // ItemId
        public NoteItemTypeEnum NoteItemType { get; set; } // NoteItemTypeId
        public string Text { get; set; } // Text (length: 150)
        public bool IsActive { get; set; } // IsActive
        public bool IsDeleted { get; set; } // IsDeleted
        public NoteTypeEnum NoteType { get; set; } // NoteTypeId
        public NoteCategoryEnum NoteCategory { get; set; } // NoteCategoryId
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
        public List<CommonSystemNoteModule> NoteModules { get; set; }
    }
}