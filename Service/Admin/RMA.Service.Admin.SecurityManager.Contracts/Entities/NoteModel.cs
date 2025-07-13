using RMA.Common.Entities;

namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public class NoteModel : AuditDetails
    {
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public string Text { get; set; }
    }
}