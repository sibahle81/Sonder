using System.Globalization;
using System.Threading;

namespace RMA.Common.Globalization
{
    public static class CultureConfiguration
    {
        public static void SetCutCulture()
        {
            // Change current culture
            CultureInfo culture = CultureInfo.CreateSpecificCulture("en-ZA");

            CultureInfo.DefaultThreadCurrentCulture = culture;
            CultureInfo.DefaultThreadCurrentUICulture = culture;

            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;
        }
    }
}
