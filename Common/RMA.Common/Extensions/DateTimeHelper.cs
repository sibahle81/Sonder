using System;

namespace RMA.Common.Extensions
{
    public static class DateTimeHelper
    {
        private const string DestinationTimeZoneId = "South Africa Standard Time";

        /// <summary>
        ///     Used to negate the milliseconds in the datetime object
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        public static DateTime TrimMilliseconds(this DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day, dt.Hour, dt.Minute, dt.Second, 0, DateTimeKind.Local);
        }

        public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek)
        {
            var diff = dt.DayOfWeek - startOfWeek;
            if (diff < 0) diff += 7;

            return dt.AddDays(-1 * diff).Date;
        }

        public static DateTime StartOfFollowingMonth(this DateTime dt)
        {
            var date = new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Local);
            return date.AddMonths(1);
        }

        public static DateTime StartOfFollowingYear(this DateTime dt)
        {
            var date = new DateTime(dt.AddYears(1).Year, 1, 1, 0, 0, 0, DateTimeKind.Local);
            return date.AddMonths(1);
        }

        public static DateTime StartOfFollowingQuarter(this DateTime dt)
        {
            var date = new DateTime(dt.Year, dt.AddMonths(3).Month, 1, 0, 0, 0, DateTimeKind.Local);
            return date.AddMonths(1);
        }

        public static DateTime StartOfNextBiAnnualPeriod(this DateTime dt)
        {
            var date = new DateTime(dt.Year, dt.AddMonths(6).Month, 1, 0, 0, 0, DateTimeKind.Local);
            return date.AddMonths(1);
        }

        public static DateTime? ToDate(this string expression)
        {
            if (expression == null) expression = string.Empty;
            try
            {
                return expression.ParseDateTime();
            }
            catch
            {
                return null;
            }
        }

        public static string FormatDate(DateTime? dt, string format)
        {
            if (!dt.HasValue) return string.Empty;
            return dt.Value.ToString(format);
        }

        public static DateTime? ToSaDateTime(this DateTime? date)
        {
            if (!date.HasValue)
            {
                return date;
            }

            return TimeZoneInfo.ConvertTimeBySystemTimeZoneId(date.Value, DestinationTimeZoneId);
        }

        public static DateTime ToSaDateTime(this DateTime date)
        {
            return TimeZoneInfo.ConvertTimeBySystemTimeZoneId(date, DestinationTimeZoneId);
        }

        public static DateTime SaNow
        {
            get
            {
                return TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, DestinationTimeZoneId);
            }
        }

        public static string SaNowStdString
        {
            get
            {
                return TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, DestinationTimeZoneId).ToString("d MMM yyyy");
            }
        }

        public static DateTime StartOfNextMonth
        {
            get
            {
                var today = SaNow.Date;
                var date = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Local);
                return date.AddMonths(1);
            }
        }

        public static DateTime StartOfNextYear
        {
            get
            {
                var today = SaNow.Date;
                return new DateTime(today.AddYears(1).Year, 1, 1, 0, 0, 0, DateTimeKind.Local);
            }
        }

        public static DateTime StartOfNextQuarter
        {
            get
            {
                var today = SaNow.Date;
                return new DateTime(today.Year, today.AddMonths(3).Month, 1, 0, 0, 0, DateTimeKind.Local);
            }
        }

        public static DateTime StartOfNextBiAnnnualPeriod
        {
            get
            {
                var today = SaNow.Date;
                return new DateTime(today.Year, today.AddMonths(6).Month, 1, 0, 0, 0, DateTimeKind.Local);
            }
        }

        public static DateTime EndOfTheMonth(DateTime date)
        {
            return new DateTime(date.Year, date.Month, 1, 0, 0, 0, DateTimeKind.Local).AddMonths(1).AddDays(-1);
        }

        public static DateTime StartOfTheMonth(DateTime date)
        {
            return new DateTime(date.Year, date.Month, 1, 0, 0, 0, DateTimeKind.Local);
        }

        public static DateTime? CheckNullDate(this DateTime? date)
        {
            if (!date.HasValue) return null;
            if (date.Value.Year < 1900) return null;
            return date.ToSaDateTime();
        }

        public static DateTime UtcNow => DateTime.UtcNow;
        public static DateTime StartOfTheDay(this DateTime d) => new DateTime(d.Year, d.Month, d.Day, 0, 0, 0, DateTimeKind.Local);
        public static DateTime EndOfTheDay(this DateTime d) => new DateTime(d.Year, d.Month, d.Day, 23, 59, 59, DateTimeKind.Local);
        public static DateTime StartOfNextDay(this DateTime d) => new DateTime(d.Year, d.Month, d.Day, 23, 59, 59, DateTimeKind.Local).AddSeconds(1);
        public static string FormatDaySlashMonthSlashYear(this DateTime d) => d.ToString("dd/MM/yyyy");
        public static DateTime GetLastDayOfMonth(this DateTime dateTime)
        {
            return new DateTime(dateTime.Year, dateTime.Month, DateTime.DaysInMonth(dateTime.Year, dateTime.Month), 0, 0, 0, DateTimeKind.Unspecified);
        }

        /// <summary>
        /// Formats date to ISO 8601 standard for date string
        /// </summary>
        /// <param name="date">Nullable date to use</param>
        /// <returns></returns>
        public static string FormatIsoDate(this DateTime? date)
        {
            if (date.HasValue)
                return date.Value.ToString("yyyy-MM-dd");

            return string.Empty;
        }
        /// <summary>
        /// Formats date to ISO 8601 standard for date string
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static string FormatIsoDate(this DateTime date)
        {
            return date.ToString("yyyy-MM-dd");
        }
    }
}