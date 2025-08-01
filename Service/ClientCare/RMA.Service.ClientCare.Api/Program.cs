﻿using Microsoft.ServiceFabric.Services.Runtime;

using RMA.Common.Globalization;
using RMA.Common.Service.Diagnostics;

using System;
using System.Threading;

namespace RMA.Service.ClientCare.Api
{
    internal static class Program
    {
        /// <summary>
        ///     This is the entry point of the service host process.
        /// </summary>
        private static void Main()
        {
            try
            {// The ServiceManifest.XML file defines one or more service type names.
             // Registering a service maps a service type name to a .NET type.
             // When Service Fabric creates an instance of this service type,
             // an instance of the class is created in this host process.
                CultureConfiguration.SetCutCulture();

                LoggingConfiguration.Configure();

                ServiceRuntime.RegisterServiceAsync("RMA.Service.ClientCare.ApiType",
                    context => new Api(context)).GetAwaiter().GetResult();

                // Prevents this host process from terminating so services keeps running. 
                Thread.Sleep(Timeout.Infinite);
            }
            catch (Exception e)
            {
                ServiceEventSource.Current.ServiceHostInitializationFailed(e.ToString());
                throw;
            }
        }
    }
}