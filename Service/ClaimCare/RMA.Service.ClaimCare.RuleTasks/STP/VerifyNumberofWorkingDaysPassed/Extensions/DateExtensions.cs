using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClaimCare.RuleTasks.STP.VerifyNumberofWorkingDaysPassed.Extensions
{
    public static class DateExtensions
    {
        /// <summary>
        /// Adds the given number of business days to the <see cref="DateTime"/>.
        /// </summary>
        /// <param name="current">The date to be changed.</param>
        /// <param name="days">Number of business days to be added.</param>
        /// <returns>A <see cref="DateTime"/> increased by a given number of business days.</returns>
        public static DateTime AddBusinessDays(this DateTime current, int days, List<Tuple<int, int>> holidayDates)
        {
            var sign = Math.Sign(days);
            var unsignedDays = Math.Abs(days);
            var isHoliday = false;

            for (var i = 0; i < unsignedDays; i++)
            {
                do
                {
                    current = current.AddDays(sign);
                    isHoliday = holidayDates.Any(t => t.Item1 == current.Month && t.Item2 == current.Day);
                }
                while (current.DayOfWeek == DayOfWeek.Saturday
                    || current.DayOfWeek == DayOfWeek.Sunday || isHoliday);
            }
            return current;
        }
    }
}
