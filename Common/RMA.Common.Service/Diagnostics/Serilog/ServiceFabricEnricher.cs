using RMA.Common.Service.ServiceFabric.Constants;

using Serilog.Core;
using Serilog.Events;

using System.Fabric;
using System.Globalization;

namespace RMA.Common.Service.Diagnostics.Serilog
{
    public class ServiceFabricEnricher : ILogEventEnricher
    {
        private LogEventProperty _applicationName;
        private LogEventProperty _applicationTypeName;
        private LogEventProperty _instanceId;
        private LogEventProperty _nodeName;
        private LogEventProperty _partitionId;
        private LogEventProperty _replicaId;
        private LogEventProperty _serviceName;
        private LogEventProperty _serviceTypeName;
        private LogEventProperty _version;

        public ServiceFabricEnricher(ServiceContext context)
        {
            Context = context;
        }

        protected ServiceContext Context { get; }

        public virtual void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            _serviceTypeName = _serviceTypeName ??
                               propertyFactory?.CreateProperty(ServiceContextProperties.ServiceTypeName,
                                   Context.ServiceTypeName);
            _serviceName = _serviceName ??
                           propertyFactory?.CreateProperty(ServiceContextProperties.ServiceName, Context.ServiceName);
            _partitionId = _partitionId ??
                           propertyFactory?.CreateProperty(ServiceContextProperties.PartitionId, Context.PartitionId);
            _nodeName = _nodeName ??
                        propertyFactory?.CreateProperty(ServiceContextProperties.NodeName, Context.NodeContext.NodeName);
            _applicationName = _applicationName ?? propertyFactory?.CreateProperty(
                                   ServiceContextProperties.ApplicationName,
                                   Context.CodePackageActivationContext.ApplicationName);
            _applicationTypeName = _applicationTypeName ?? propertyFactory?.CreateProperty(
                                       ServiceContextProperties.ApplicationTypeName,
                                       Context.CodePackageActivationContext.ApplicationTypeName);
            _version = _version ?? propertyFactory?.CreateProperty(ServiceContextProperties.ServicePackageVersion,
                           Context.CodePackageActivationContext.CodePackageVersion);

            logEvent?.AddPropertyIfAbsent(_serviceTypeName);
            logEvent?.AddPropertyIfAbsent(_serviceName);
            logEvent?.AddPropertyIfAbsent(_partitionId);
            logEvent?.AddPropertyIfAbsent(_nodeName);
            logEvent?.AddPropertyIfAbsent(_applicationName);
            logEvent?.AddPropertyIfAbsent(_applicationTypeName);
            logEvent?.AddPropertyIfAbsent(_version);

            if (Context is StatelessServiceContext)
            {
                _instanceId = _instanceId ?? propertyFactory?.CreateProperty(ServiceContextProperties.InstanceId,
                                  Context.ReplicaOrInstanceId.ToString(CultureInfo.InvariantCulture));
                logEvent.AddPropertyIfAbsent(_instanceId);
            }
            else if (Context is StatefulServiceContext)
            {
                _replicaId = _replicaId ?? propertyFactory?.CreateProperty(ServiceContextProperties.ReplicaId,
                                 Context.ReplicaOrInstanceId.ToString(CultureInfo.InvariantCulture));
                logEvent.AddPropertyIfAbsent(_replicaId);
            }
        }
    }
}