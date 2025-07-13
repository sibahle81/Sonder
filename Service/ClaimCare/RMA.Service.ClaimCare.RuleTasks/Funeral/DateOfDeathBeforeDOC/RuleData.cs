using System;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.DateOfDeathBeforeDOC
{
    public class RuleData
    {
        public DateTime DateOfDeath { get; set; }
        public DateTime DOCOfPolicy { get; set; }
    }
}
