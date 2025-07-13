using System;

namespace RMA.Service.Billing.Contracts.Entities
{
    public class AgeAnalysisNote
    {
        public int Id { get; set; }
        public int RolePlayerId { get; set; }
        public string Text { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
