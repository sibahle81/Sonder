using Microsoft.ApplicationInsights.Extensibility;

using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Sinks.MSSqlServer;

using System;
using System.Collections.Generic;
using System.Data;

namespace RMA.Common.Service.Diagnostics
{
    public static class LoggingConfiguration
    {
        public static void Configure(bool enableApplicationInsights = true)
        {
            var connectionString = Environment.GetEnvironmentVariable("DIAG_DBConnection");
            var levelValue = Environment.GetEnvironmentVariable("Diagnostics_LogLevel");
            Enum.TryParse(levelValue, true, out LogEventLevel level);

            const string logTable = "Logs";
            var columnOptions = new ColumnOptions
            {
                AdditionalDataColumns = new List<DataColumn> { new DataColumn("Username") }
            };

            // we don't need XML data
            columnOptions.Store.Remove(StandardColumn.Properties);
            // we want JSON data
            columnOptions.Store.Add(StandardColumn.LogEvent);

            var config = new LoggerConfiguration()
                    .MinimumLevel.Debug()
                    .Enrich.FromLogContext()
                    .Enrich.WithAssemblyName()
                    .Enrich.WithEnvironmentUserName()
                    .Enrich.WithMachineName()
                    .Enrich.WithExceptionDetails()
                    .WriteTo.Debug();

            if (enableApplicationInsights)
            {
                config = config
                    .WriteTo.ApplicationInsights(TelemetryConfiguration.Active, TelemetryConverter.Traces, level)
                    .WriteTo.MSSqlServer(connectionString, logTable, columnOptions: columnOptions, restrictedToMinimumLevel: level, autoCreateSqlTable: true);
            }

            Log.Logger = config.CreateLogger();
        }
    }
}