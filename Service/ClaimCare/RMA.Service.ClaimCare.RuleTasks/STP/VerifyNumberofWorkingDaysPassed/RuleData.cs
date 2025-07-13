using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.RuleTasks.STP.VerifyNumberofWorkingDaysPassed
{
    public class RuleData
    {
        public DateTime ClaimDate { get; set; }
        public int WorkingDaysPassed { get; set; }

        /// <summary>
        /// OPTIONAL : Set in the format of month,day for the Tuple type, if not passed, the rule will fetch it
        /// </summary>
        public List<Tuple<int, int>> HolidayDates { get; set; }
    }
}
