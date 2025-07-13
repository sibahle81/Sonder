using CommonServiceLocator;

using RMA.Common.Globalization;
using RMA.Common.Service.Diagnostics;
using RMA.Common.Service.ServiceLocation;

using System;
using System.Threading;

namespace RMA.Service.Admin.MasterDataManager
{
    internal static class Program
    {
        /// <summary>
        ///     This is the entry point of the service host process.
        /// </summary>
        private static void Main()
        {
            try
            {
                CultureConfiguration.SetCutCulture();
                ApplicationInsightsConfiguration.Configure();
                LoggingConfiguration.Configure();

                AbcPdfConfiguration.EnsureLicense();
                var builder = ContainerConfiguration.Configure();
                AutoMapperConfiguration.Configure(builder);

                using (var container = builder.Build())
                {
                    var csl = new AutofacServiceLocator(container);
                    ServiceLocator.SetLocatorProvider(() => csl);

                    // Prevents this host process from terminating so services keep running.
                    Thread.Sleep(Timeout.Infinite);
                }
            }
            catch (Exception e)
            {
                ServiceEventSource.Current.ServiceHostInitializationFailed(e.ToString());
                throw;
            }
        }
    }
}