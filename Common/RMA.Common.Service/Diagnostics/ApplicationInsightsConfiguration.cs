using Microsoft.ApplicationInsights.DependencyCollector;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.ApplicationInsights.ServiceFabric;
using Microsoft.ApplicationInsights.ServiceFabric.Module;
using Microsoft.ApplicationInsights.WindowsServer;

using System;
using System.Diagnostics;

namespace RMA.Common.Service.Diagnostics
{
    public static class ApplicationInsightsConfiguration
    {
        public static TelemetryConfiguration CurrentConfiguration { get; private set; }
        public static void Configure()
        {
            if (TelemetryConfiguration.Active.TelemetryInitializers.Count > 1)
            {
                return;
            }

            var instrumentationKey = Environment.GetEnvironmentVariable("APPINSIGHTS_INSTRUMENTATIONKEY");
            TelemetryConfiguration config = new TelemetryConfiguration(instrumentationKey);

            config.TelemetryInitializers.Add(new FabricTelemetryInitializer());
            config.TelemetryInitializers.Add(new OperationCorrelationTelemetryInitializer());
            config.TelemetryInitializers.Add(new HttpDependenciesParsingTelemetryInitializer());
            config.TelemetryInitializers.Add(new CodePackageVersionTelemetryInitializer());

            /** Dependency Tracking **/
            var module = new DependencyTrackingTelemetryModule();
            module.ExcludeComponentCorrelationHttpHeadersOnDomains.Add("core.windows.net");
            module.ExcludeComponentCorrelationHttpHeadersOnDomains.Add("core.chinacloudapi.cn");
            module.ExcludeComponentCorrelationHttpHeadersOnDomains.Add("core.cloudapi.de");
            module.ExcludeComponentCorrelationHttpHeadersOnDomains.Add("core.usgovcloudapi.net");
            module.IncludeDiagnosticSourceActivities.Add("Microsoft.Azure.ServiceBus");
            module.IncludeDiagnosticSourceActivities.Add("Microsoft.Azure.EventHubs");
            module.Initialize(config);

            //collect system performance parameters such as your CPU and memory load
            new ServiceRemotingRequestTrackingTelemetryModule().Initialize(config);
            new ServiceRemotingDependencyTrackingTelemetryModule().Initialize(config);

            // For Developer mode send telemetry immediately
            if (Debugger.IsAttached)
            {
                new DeveloperModeWithDebuggerAttachedTelemetryModule().Initialize(config);
            }
            else
            {
                /** new PerformanceCollectorModule().Initialize(config);

                //Add live Streaming
                //QuickPulseTelemetryProcessor processor = null;

                //config.TelemetryProcessorChainBuilder
                //    .Use(next =>
                //    {
                //        processor = new QuickPulseTelemetryProcessor(next);
                //        return processor;
                //    })
                //    .Build();

                //var quickPulse = new QuickPulseTelemetryModule();
                //quickPulse.Initialize(config);
                //quickPulse.RegisterTelemetryProcessor(processor); **/
            }

            CurrentConfiguration = config;
        }
    }
}
