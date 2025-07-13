using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net.Mail;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace RMA.Common.Extensions
{
    public static class StringExtensions
    {
        public static IEnumerable<string> GetLines(this string str, bool removeEmptyLines = false)
        {
            if (string.IsNullOrEmpty(str))
                return new List<string>();

            return str.Split(new[] { "\r\n", "\r", "\n" },
                removeEmptyLines ? StringSplitOptions.RemoveEmptyEntries : StringSplitOptions.None);
        }

        public static string GenerateDataHash(params object[] values)
        {
            if (values == null)
            {
                return string.Empty;
            }
            for (var i = 0; i < values.Length - 1; i++)
            {
                if (values[i] == null)
                {
                    values[i] = string.Empty;
                }
                else
                {
                    values[i] = values[i].ToString().Trim();
                }
            }
            var stringValue = string.Join("_", values);
            var messageBytes = Encoding.Unicode.GetBytes(stringValue.ToUpper());
            using (var sHhash = new SHA512Managed())
            {
                var value = sHhash.ComputeHash(messageBytes);
                return Convert.ToBase64String(value);
            }
        }

        public static string WithCurrentCulture(this string value)
        {
            if (value == null)
            {
                return string.Empty;
            }
            return value.ToString(CultureInfo.CurrentCulture);
        }

        public static bool IsNumeric(this string expression)
        {
            if (expression == null) return false;
            return double.TryParse(
                Convert.ToString(expression, CultureInfo.InvariantCulture),
                NumberStyles.Any,
                NumberFormatInfo.InvariantInfo,
                out _);
        }

        public static bool IsValidEmail(this string value)
        {
            try
            {
                var address = new MailAddress(value);
                return address.Address == value;
            }
            catch
            {
                return false;
            }
        }

        public static decimal TryParseDecimal(this string value)
        {
            if (value == null) return 0;
            decimal.TryParse(
                Convert.ToString(value, CultureInfo.InvariantCulture),
                NumberStyles.Any,
                NumberFormatInfo.InvariantInfo,
                out var number);
            return number;
        }

        public static string RemoveNumberFormatting(this string value)
        {
            if (value == null) return string.Empty;
            return value.Replace(" ", string.Empty).Replace("\xA0", string.Empty).Replace(",", string.Empty);
        }

        public static bool TryParseDateTime(this string value, out DateTime dt)
        {
            if (string.IsNullOrEmpty(value) || (IsNumeric(value) && decimal.Parse(value) == 0))
            {
                dt = DateTime.MinValue;
                return false;
            }

            var dateVal = ParseDateTime(value);
            dt = dateVal;
            return dateVal != DateTime.MinValue;
        }

        public static DataTable ToDataTable<T>(this IList<T> data)
        {
            var props = TypeDescriptor.GetProperties(typeof(T));
            var table = new DataTable();
            if (data != null)
            {
                for (var i = 0; i < props.Count; i++)
                {
                    var prop = props[i];
                    Type propertyType = prop.PropertyType.IsGenericType
                        && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>)
                        ? prop.PropertyType.GetGenericArguments()[0]
                        : prop.PropertyType;
                    table.Columns.Add(prop.Name, propertyType);
                }

                var values = new object[props.Count];
                foreach (var item in data)
                {
                    for (var i = 0; i < values.Length; i++) values[i] = props[i].GetValue(item);
                    table.Rows.Add(values);
                }
            }
            return table;
        }



        public static int ToInt(this string value, int defaultValue)
        {
            if (string.IsNullOrEmpty(value)) return defaultValue;
            return Convert.ToInt32(value);
        }

        public static int? ToInt(this string value)
        {
            if (string.IsNullOrEmpty(value)) return null;
            return Convert.ToInt32(value);
        }

        public static bool ToBoolean(this string value, bool defaultValue)
        {
            if (string.IsNullOrEmpty(value)) return defaultValue;
            return Convert.ToBoolean(value);
        }

        public static string GetNumbers(this string input)
        {
            return string.IsNullOrEmpty(input) ? string.Empty : new string(input.Where(char.IsDigit).ToArray());
        }

        public static string TrimWithNull(this string input)
        {
            return string.IsNullOrEmpty(input) ? null : input.Trim();
        }

        /// <summary>
        ///     Try and parse the date string passed in according to the format specified and return a <see cref="DateTime" />
        /// </summary>
        /// <param name="date">String to be parsed as <see cref="DateTime" /></param>
        /// <returns>Valid <see cref="DateTime" /> if the string could be parsed according to the passed in format else NULL</returns>
        public static DateTime ParseDateTime(this string date)
        {
            var tmpDate = ParseDateTimeNullable(date);
            return tmpDate ?? DateTime.MinValue;
        }

        public static DateTime ParseDateTime(this object date)
        {
            if (date == null) return DateTime.MinValue;
            if (date == DBNull.Value) return DateTime.MinValue;
            return ParseDateTime(date.ToString());
        }

        /// <summary>
        ///     Try and parse the date string passed in according to the format specified and return a <see cref="DateTime" />
        /// </summary>
        /// <param name="date">String to be parsed as <see cref="DateTime" /></param>
        /// <returns>Valid <see cref="DateTime" /> if the string could be parsed according to the passed in format else NULL</returns>
        public static DateTime? ParseDateTimeNullable(this string date)
        {
            if (!string.IsNullOrEmpty(date))
            {
                date = date.Replace("\\", string.Empty);
                date = date.Replace("/", string.Empty);
                date = date.Replace("-", string.Empty);
                date = date.Replace(":", string.Empty);
            }

            if (string.IsNullOrEmpty(date) || (IsNumeric(date) && Math.Abs(double.Parse(date, CultureInfo.InvariantCulture)) < 1))
                return null;

            DateTime tmpDate;
            bool canParse = DateTime.TryParse(date, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out tmpDate);
            if (canParse)
                return tmpDate;

            string yearFirstFormat = "yyyyMMdd";
            string dayFirstFormat = "ddMMyyyy";
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

            if (!DateTime.TryParseExact(date, yearFirstFormat, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out tmpDate))
            {
                if (!DateTime.TryParseExact(AddLeadingZeroDate(date), dayFirstFormat, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out tmpDate))
                    return null;
                return tmpDate;
            }

            if (tmpDate.Year < 1232)
            {
                // Yes this is the minimum year this function can support.
                if (!DateTime.TryParseExact(AddLeadingZeroDate(date), dayFirstFormat, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out tmpDate))
                    return null;
                return tmpDate;
            }
            return tmpDate;
        }


        /// <summary>
        ///     Add a single leading zero to the date field.
        /// </summary>
        /// <param name="date">The date to format.</param>
        /// <returns>The date with a single leading zero.</returns>
        private static string AddLeadingZeroDate(string date)
        {
            var result = date.TrimStart('0');

            if (result.Length == 0) return string.Empty;

            if (result.Length < 8) result = result.PadLeft(8, '0');

            return result;
        }

        public static long ToLong(this string str)
        {
            return long.TryParse(str, out var result)
                ? result
                : 0;
        }

        public static double ToDouble(this string amountString)
        {
            if (string.IsNullOrWhiteSpace(amountString)) return 0;

            if (!double.TryParse(amountString, out var dbl))
            {
                _ = double.TryParse(amountString.Replace(".", ","), out dbl);
            }

            return dbl;
        }

        public static decimal ToDecimal(this string amountString)
        {
            if (string.IsNullOrWhiteSpace(amountString)) return 0m;

            if (!decimal.TryParse(amountString, out decimal dbl))
            {
                _ = decimal.TryParse(amountString.Replace(".", ","), out dbl);
            }

            return dbl;
        }

        public static bool IsValidIdentityNumber(this string identityNumber)
        {
            return Regex.IsMatch(identityNumber,
                @"^(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))$", RegexOptions.None, TimeSpan.FromMilliseconds(100));
        }

        public static bool IsValidPostalCode(this string postalCode)
        {
            return Regex.IsMatch(postalCode, "^[0-9]{4,6}$",RegexOptions.None, TimeSpan.FromMilliseconds(100));
        }

        public static bool IsValidPhone(this string phoneNumber)
        {
            return Regex.IsMatch(phoneNumber, "^[0-9]{10,14}$", RegexOptions.None, TimeSpan.FromMilliseconds(100));
        }

        public static string EncodeXml(this string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            return text
                .Replace("&", "&amp;")
                .Replace("'", "&apos;")
                .Replace("\"", "&quot;")
                .Replace(">", "&gt;")
                .Replace("<", "&lt;");
        }

        public static string TrimText(this string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty; // Prevents null return

            text = text.Trim();
            text = text.Trim('\'', '"'); // Simplified syntax

            return text;
        }

        public static string Quoted(this string text)
        {
            if (text is null) return "''";
            text = text.TrimText().Replace("'", "''");
            return $"'{text}'";
        }

        public static DateTime? GetDateOfBirthFromRSAIdNumber(this string idNumber)
        {
            if (string.IsNullOrEmpty(idNumber) || idNumber.Length != 13) return null;
            var Year = idNumber.Substring(0, 2);
            var Month = idNumber.Substring(2, 2);
            var Day = idNumber.Substring(4, 2);
            var milleniumYear = (DateTimeHelper.SaNow.Year - 2000);

            Year = (int.Parse(Year) > milleniumYear ? "19" : "20") + Year;

            return new DateTime(int.Parse(Year), int.Parse(Month), int.Parse(Day), 0, 0, 0, DateTimeKind.Unspecified);
        }

        /// <summary>
        /// Get field names from header. This is useful in getting columns header from an spreadsheet-based string
        /// </summary>
        /// <param name="headerLine"></param>
        /// <param name="delimiter">Delimiter to use to find headers</param>
        /// <returns></returns>
        public static string[] GetFieldsFromHeader(this string headerLine, char[] delimiter)
        {
            // The || allows blank headers if at least one header or delimiter exists.
            return headerLine?.Split(delimiter)
               .Select(f => f.Trim())
               .Where(f =>
                   !string.IsNullOrWhiteSpace(f)
                   || !String.IsNullOrEmpty(headerLine)).ToArray();
        }

        public static List<PropertyInfo> MapHeaderToProperties<T>(this string[] headerFields)
        {
            var map = new List<PropertyInfo>();
            Type t = typeof(T);

            // Include null properties so these are skipped when parsing the data lines.
            headerFields
                .Select(f =>
                    (
                        f,
                        t.GetProperty(f,
                           BindingFlags.Instance
                           | BindingFlags.Public
                           | BindingFlags.IgnoreCase
                           | BindingFlags.FlattenHierarchy)
                    )
                )
                .ForEach(fp => map.Add(fp.Item2));

            return map;
        }

        public static string ComputeHashSHA512(this string plainText)
        {
            // If salt is not specified, generate it on the fly.
            byte[] saltBytes = null;

            // Define min and max salt sizes.
            const int minSaltSize = 4;
            const int maxSaltSize = 8;

            // Generate a random number for the size of the salt.
            var random = new Random();
            var saltSize = random.Next(minSaltSize, maxSaltSize);

            // Allocate a byte array, which will hold the salt.
            saltBytes = new byte[saltSize];

            // Initialize a random number generator.
            using (var rng = new RNGCryptoServiceProvider())
            {
                // Fill the salt with cryptographically strong byte values.
                rng.GetNonZeroBytes(saltBytes);
            }


            // Convert plain text into a byte array.
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);

            // Allocate array, which will hold plain text and salt.
            var plainTextWithSaltBytes = new byte[plainTextBytes.Length + saltBytes.Length];

            // Copy plain text bytes into resulting array.
            for (var i = 0; i < plainTextBytes.Length; i++)
            {
                plainTextWithSaltBytes[i] = plainTextBytes[i];
            }

            // Append salt bytes to the resulting array.
            for (var i = 0; i < saltBytes.Length; i++)
            {
                plainTextWithSaltBytes[plainTextBytes.Length + i] = saltBytes[i];
            }

            // Because we support multiple hashing algorithms, we must define
            // hash object as a common (abstract) base class. We will specify the
            // actual hashing algorithm class later during object creation.

            byte[] hashBytes = null;

            using (var hash = new SHA512Managed())
            {
                // Compute hash value of our plain text with appended salt.
                hashBytes = hash.ComputeHash(plainTextWithSaltBytes);
            }

            // Create array which will hold hash and original salt bytes.
            var hashWithSaltBytes = new byte[hashBytes.Length + saltBytes.Length];

            // Copy hash bytes into resulting array.
            for (var i = 0; i < hashBytes.Length; i++)
            {
                hashWithSaltBytes[i] = hashBytes[i];
            }

            // Append salt bytes to the result.
            for (var i = 0; i < saltBytes.Length; i++)
            {
                hashWithSaltBytes[hashBytes.Length + i] = saltBytes[i];
            }

            // Convert result into a base64-encoded string.
            var hashValue = Convert.ToBase64String(hashWithSaltBytes);

            // Return the result.
            return hashValue;
        }

        public static string ToStringFromBase64(this string base64String)
        {
            var byteData = Convert.FromBase64String(base64String);
            return Encoding.UTF8.GetString(byteData);
        }

        public static string ToBase64FromString(this string text)
        {
            var byteData = Encoding.UTF8.GetBytes(text);
            return Convert.ToBase64String(byteData);
        }

        public static bool IsBase64String(this string base64String)
        {
            if (string.IsNullOrWhiteSpace(base64String)) return false;

            base64String = base64String.Trim();
            return (base64String.Length % 4 == 0) && Regex.IsMatch(base64String, @"^[A-Za-z0-9+/]*(={0,2})$", RegexOptions.None,TimeSpan.FromMilliseconds(1000));
        }

        /// <summary>
        /// The string will come through as an encoded URI Component before using it it should be decoded and trimmed 
        /// </summary>
        /// <param name="text">Text value to decode</param>
        /// <returns></returns>
        public static string Decode(this string text)
        {
            return string.IsNullOrEmpty(text) ? null : Uri.UnescapeDataString(text).Trim();
        }

        /// <summary>
        /// The string will encoded URI Component before using it
        /// </summary>
        /// <param name="text">Text value to encode</param>
        /// <returns></returns>
        public static string Encode(this string text)
        {
            return string.IsNullOrEmpty(text) ? null : Uri.EscapeDataString(text).Trim();
        }

        public static string CapitalizeFirstLetter(this string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty;
            if (text.Length == 1) return char.ToUpper(text[0]).ToString();
            return char.ToUpper(text[0]) + text.Substring(1);
        }

        public static string SplitCamelCaseText(this string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty;
            return Regex.Replace(text, "(\\B[A-Z])", " $1",RegexOptions.None,TimeSpan.FromMilliseconds(100));
        }

        public static int LevenshteinDistance(this string s1, string comparisonString)
        {
            if (s1 == null) throw new ArgumentNullException(nameof(s1));
            if (comparisonString == null) throw new ArgumentNullException(nameof(comparisonString));

            int[][] dp = new int[s1.Length + 1][];
            for (int i = 0; i <= s1.Length; i++)
            {
                dp[i] = new int[comparisonString.Length + 1];
            }

            for (int i = 0; i <= s1.Length; i++)
            {
                for (int j = 0; j <= comparisonString.Length; j++)
                {
                    if (i == 0)
                    {
                        dp[i][j] = j;
                    }
                    else if (j == 0)
                    {
                        dp[i][j] = i;
                    }
                    else
                    {
                        int cost = (s1[i - 1] == comparisonString[j - 1]) ? 0 : 1;
                        dp[i][j] = Math.Min(Math.Min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
                    }
                }
            }

            return dp[s1.Length][comparisonString.Length];
        }

        public static string CapitalizedFirstLetter(this string strValue)
        {
            return $"{strValue?.Substring(0, 1).ToUpper()}{strValue?.Substring(1).ToLower()}";
        }
    }
}