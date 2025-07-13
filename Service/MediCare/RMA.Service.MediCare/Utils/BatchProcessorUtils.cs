using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;

namespace RMA.Service.MediCare.Utils
{
    public static class BatchProcessorUtils
    {
        public static string GetVatCode(decimal vatAmount)
        {
            return vatAmount > 0 ? "1" : "2";
        }

        public static DateTime? ConvertToDate(string date, bool addTime)
        {
            if (string.IsNullOrEmpty(date))
            {
                return null;
            }

            var sYear = "1900";
            var sMonth = string.Empty;
            var sDay = "01";
            var sHour = "00";
            var sMinute = "00";
            var nMonth = 1;

            if (date.Length >= 8)
            {
                sYear = date.Substring(0, 4);
                sMonth = date.Substring(4, 2);
                nMonth = int.Parse(sMonth);
                sDay = date.Substring(6, 2);

                if (date.Length >= 10 && addTime)
                {
                    // Assume has HHMM as well
                    sHour = date.Substring(8, 2);
                    sMinute = date.Substring(10, 2);
                }
                else
                {
                    // Just the date - no HHMM
                    sHour = "00";
                    sMinute = "00";
                }
            }

            sMonth = GetMonthName(nMonth);

            var sCC2Date = sDay + " " + sMonth + " " + sYear;

            if (addTime)
            {
                sCC2Date = sCC2Date + " " + sHour + ":" + sMinute;
            }

            DateTime value;
            var success = DateTime.TryParse(sCC2Date, out value);

            if (success && value.Year > 1753)
            {
                return value;
            }

            return null;
        }

        private static string GetMonthName(int nMonth)
        {
            switch (nMonth)
            {
                case 1:
                    {
                        return "Jan";

                    }
                case 2:
                    {
                        return "Feb";
                    }
                case 3:
                    {
                        return "Mar";
                    }
                case 4:
                    {
                        return "Apr";
                    }
                case 5:
                    {
                        return "May";
                    }
                case 6:
                    {
                        return "Jun";
                    }
                case 7:
                    {
                        return "Jul";
                    }
                case 8:
                    {
                        return "Aug";
                    }
                case 9:
                    {
                        return "Sep";
                    }
                case 10:
                    {
                        return "Oct";
                    }
                case 11:
                    {
                        return "Nov";
                    }
                case 12:
                    {
                        return "Dec";
                    }
            }

            throw new Exception(string.Format("Invalid Month : {0}", nMonth));
        }

        public static void DateAdmittedDischarged(DateTime? serviceDateMin, DateTime? serviceDateMax,
            ref DateTime? admittedDate, ref DateTime? dischargedDate)
        {
            if (admittedDate == null && serviceDateMin != null)
            {
                admittedDate = serviceDateMin;
            }

            if (dischargedDate == null && serviceDateMax != null)
            {
                dischargedDate = serviceDateMax;

            }

            if (admittedDate == null || dischargedDate == null)
            {
                return;
            }

            if (!(admittedDate > dischargedDate))
            {
                return;
            }

            //admitted date must be before the discharge date.  switch the values.
            var tempDt = admittedDate;
            admittedDate = dischargedDate;
            dischargedDate = tempDt;
        }

        public static double DefaultIfNullDouble(string vVal, double vDefault)
        {
            if (string.IsNullOrEmpty(vVal))
            {
                return vDefault;
            }

            vVal = vVal.Trim();
            vVal = vVal.Replace(',', '.').Replace(" ", string.Empty);

            return Convert.ToDouble(vVal, CultureInfo.InvariantCulture);
        }

        public static decimal DefaultIfNullDecimal(string vVal, decimal vDefault)
        {
            if (string.IsNullOrEmpty(vVal))
            {
                return vDefault;
            }

            vVal = vVal.Trim();
            vVal = vVal.Replace(',', '.').Replace(" ", string.Empty);

            return Convert.ToDecimal(vVal, CultureInfo.InvariantCulture);
        }

        public static DateTime ParseDateTime(object date)
        {
            if (date == null) return DateTime.MinValue;
            return date == DBNull.Value ? DateTime.MinValue : ParseDateTime(date.ToString());
        }

        public static DateTime ParseDateTime(string date)
        {
            date = date?.Trim();

            if (string.IsNullOrEmpty(date) || (date.IsNumeric() && decimal.Parse(date) == 0))
            {
                return DateTime.MinValue;
            }

            DateTime tmpDate;
            var canPase = DateTime.TryParse(date, out tmpDate);
            if (canPase) return tmpDate;

            var yearFirstFormat = "yyyyMMdd";
            var dayFirstFormat = "ddMMyyyy";

            if (date.Length > 8)
            {
                yearFirstFormat = "yyyyMMddHHmm";
                dayFirstFormat = "ddMMyyyyHHmm";
            }

            if (date.Length > 12)
            {
                yearFirstFormat = "yyyyMMddHHmmss";
                dayFirstFormat = "ddMMyyyyHHmmss";
            }

            if (!DateTime.TryParseExact(date, yearFirstFormat, null, DateTimeStyles.AssumeLocal, out tmpDate))
            {
                if (!DateTime.TryParseExact(AddLeadingZeroDate(date), dayFirstFormat, null, DateTimeStyles.AssumeLocal, out tmpDate))
                {
                    return DateTime.MinValue;
                }
                return tmpDate;
            }

            if (tmpDate.Year < 1232) //Yes this is the minimum year this function can support.
            {
                if (
                    !DateTime.TryParseExact(AddLeadingZeroDate(date), dayFirstFormat, null, DateTimeStyles.AssumeLocal, out tmpDate))
                {
                    return DateTime.MinValue;
                }
                return tmpDate;
            }
            return tmpDate;
        }

        private static string AddLeadingZeroDate(string date)
        {
            var result = date.TrimStart('0');

            if (result.Length == 0)
            {
                return "";
            }

            if (result.Length < 8)
            {
                result = result.PadLeft(8, '0');
            }

            return result;
        }

        public static bool IsNumeric(this string expression)
        {
            if (expression == null) return false;
            double number;
            return Double.TryParse(Convert.ToString(expression, CultureInfo.InvariantCulture), NumberStyles.Any,
                                   NumberFormatInfo.InvariantInfo, out number);
        }

        public static string GetDobFromSaId(string idNumber)
        {
            if (ValidateSaIdNumber(idNumber))
            {
                var Year = idNumber?.Substring(0, 2);
                var Month = idNumber?.Substring(2, 2);
                var Day = idNumber?.Substring(4, 2);

                /*Make sure year is parsed correctly (assumes 20 is 2020 and 21 is 1921)*/
                var iYear = 0;
                int.TryParse(Year, out iYear);
                if (iYear == 0)
                {
                    iYear = 2000;
                }
                if (iYear >= 1 && iYear <= 20)
                {
                    iYear += 2000;
                }
                if (iYear >= 21 && iYear <= 99)
                {
                    iYear += 1900;
                }
                if (iYear <= 1899 || iYear >= 2101)
                {
                    iYear = 2000;
                }
                if (!string.IsNullOrWhiteSpace(Month))
                {
                    var month = Enum.GetName(typeof(Month), Convert.ToInt32(Month));
                    var date = Day + " " + month + " " + iYear;
                    DateTime dateTime;
                    if (DateTime.TryParse(date, out dateTime))
                        return date;
                    return string.Empty;
                }
            }
            return string.Empty;
        }

        public static bool ValidateSaIdNumber(string idNumber)
        {
            if (string.IsNullOrEmpty(idNumber)) return false;
            //Check 1 - length must be 13 characters long
            if (idNumber.Length != 13)
                return false;

            //Check 2 - All characters must be numberic
            if (idNumber.Any(ch => char.IsNumber(ch) == false))
            {
                return false;
            }

            //Check 3 = modulo 10
            //Remove the check digit from the number
            var checkNumber = int.Parse(idNumber.Substring(12));

            //Extract every alternate digit from the ID number starting from
            //the second digit and create a number from it
            var firstNumberBuilder = new StringBuilder();
            for (var index = 1; index < 12; index += 2)
            {
                firstNumberBuilder.Append(idNumber[index]);
            }

            //Multiply this newly created number by 2
            var firstNumberString = firstNumberBuilder.ToString();
            var firstNumber = int.Parse(firstNumberString);
            firstNumber = firstNumber * 2;
            firstNumberString = firstNumber.ToString();

            //Sum each digit of this newly formed number
            var sum = 0;

            foreach (var c in firstNumberString)
            {
                var s = new string(c, 1);
                sum += int.Parse(s);
            }

            //Add this sum to the currently unhandled digits,
            //i.e. the 1st,3rd,5th,7th,9th,11th digits
            for (var index = 0; index < 11; index += 2)
            {
                var s = idNumber.Substring(index, 1);
                sum += int.Parse(s);
            }

            //Get the modulus (remained) of this result / 10
            sum = sum % 10;

            //Special handling if number divisable by 10
            if (sum == 0)
            {
                sum = 10;
            }

            //subtract this remainder from 10 and ensure that this answer
            //is the same as the final check digit
            sum = 10 - sum;

            if (sum == checkNumber)
            {
                return true;
            }

            return false;
        }

        public static void AddResourceKeyToDictionary(Dictionary<string, string> resourceKeys, string key, string value)
        {
            if (resourceKeys!=null && resourceKeys.ContainsKey(key))
            {
                value = $"{resourceKeys[key]}, {value}";
                resourceKeys[key] = value;
            }
            else
            {
                resourceKeys?.Add(key, value);
            }
        }

        public static string[] SplitICD10Codes(string icd10Codes)
        {
            string[] lstICD10Code = icd10Codes?.Trim().Split(new char[] { '/', ' ', ',', ';', '#', '+' }, StringSplitOptions.RemoveEmptyEntries);
            return lstICD10Code;
        }

        public static string GetEnumDisplayName(this Enum enumType)
        {
            if (enumType != null)
                return enumType.GetType().GetMember(enumType.ToString())
                           .First()
                           .GetCustomAttribute<DisplayAttribute>()
                           .Name;
            else
                return string.Empty;
        }

        public enum Month
        {
            Jan = 1,
            Feb = 2,
            Mar = 3,
            Apr = 4,
            May = 5,
            Jun = 6,
            Jul = 7,
            Aug = 8,
            Sep = 9,
            Oct = 10,
            Nov = 11,
            Dec = 12
        }
    }
}
