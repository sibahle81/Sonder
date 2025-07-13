namespace RMA.Common.Extensions
{
    public static class NumberExtensions
    {
        private static readonly (long Threshold, string Suffix)[] Abbreviations = new[] { (1000000000000000L, "Q"), (1000000000000L, "T"), (1000000000L, "B"), (1000000L, "M"), (1000L, "K") };

        public static string OrdinalSuffix(this int num)
        {
            if (num <= 0) return num.ToString();

            switch (num % 100)
            {
                case 11:
                case 12:
                case 13:
                    return num + "th";
            }

            switch (num % 10)
            {
                case 1:
                    return num + "st";
                case 2:
                    return num + "nd";
                case 3:
                    return num + "rd";
                default:
                    return num + "th";
            }
        }

        public static string ToAbbreviatedShortNumberString(this long number)
        {
            foreach (var (threshold, suffix) in Abbreviations)
            {
                if (number >= threshold)
                {
                    return $"{(number / (double)threshold):0.#}{suffix}";
                }
            }
            return number.ToString();
        }
    }
}
