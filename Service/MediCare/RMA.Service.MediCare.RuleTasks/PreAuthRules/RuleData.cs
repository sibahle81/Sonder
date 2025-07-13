using System;

namespace RMA.Service.MediCare.RuleTasks.PreAuthRules
{
    public class RuleData
    {
        public DateTime? EventDate { get; set; }
        public DateTime? DateAuthorisedFrom { get; set; }
        public DateTime? DateAuthorisedTo { get; set; }
        public DateTime? InjuryDate { get; set; }
        public DateTime? DateOfDeath { get; set; }
    }
}
