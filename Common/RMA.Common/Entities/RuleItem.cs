using System;

namespace RMA.Common.Entities
{
    public class RuleItem
    {
        public int Id { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }

        public int ItemId { get; set; }
        public int RuleId { get; set; }
        public string RuleConfiguration { get; set; }
    }
}