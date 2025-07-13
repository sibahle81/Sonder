using RMA.Common.Entities;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyNote : AuditDetails
    {
        public int ItemId { get; set; }
        public string ItemType { get; set; }


        public int PolicyNoteId { get; set; }
        public int PolicyId { get; set; }
        public string Text { get; set; }
    }
}