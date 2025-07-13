using Microsoft.Extensions.Logging;
using Microsoft.ServiceFabric.Actors.Client;
using Microsoft.ServiceFabric.Actors.Remoting.V2.FabricTransport.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Remoting.FabricTransport;
using Microsoft.ServiceFabric.Services.Remoting.V2.FabricTransport.Client;

using RMA.Common.Exceptions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric.Constants;

using ServiceFabric.Remoting.CustomHeaders;

using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace RMA.Common.Service.ServiceFabric
{
    /// <summary>
    ///     Provides create method to create proxy factories with built-in tracing and logging
    /// </summary>
    public class ProxyFactoryProvider : IProxyFactoryProvider
    {
        private readonly Func<CustomHeaders> _customHeadersProvider;

        /// <summary>
        ///     Create an instance
        /// </summary>
        public ProxyFactoryProvider()
        {
            _customHeadersProvider = () =>
            {
                if (!RmaIdentity.IsAuthenticated)
                {
                    return new CustomHeaders
                    {
                        {HeaderIdentifiers.TraceId, RmaIdentity.TraceId}
                    };
                }


                var headers = new CustomHeaders
                {
                    {HeaderIdentifiers.TraceId, RmaIdentity.TraceId}
                };
                var index = 0;
                foreach (var claim in RmaIdentity.Claims)
                {
                    headers.Add($"{index}_{claim.Type}", claim.Value);
                    index++;
                }

                return headers;
            };
        }

        /// <inheritdoc />
        /// <summary>
        ///     Create an instance of <see cref="Microsoft.ServiceFabric.Services.Remoting.Client.ServiceProxyFactory" /> with
        ///     built-in tracing and logging
        /// </summary>
        /// <returns>
        ///     An instance of <see cref="Microsoft.ServiceFabric.Services.Remoting.Client.ServiceProxyFactory" /> with
        ///     built-in tracing and logging
        /// </returns>
        public IServiceProxyFactory CreateServiceProxyFactory()
        {
            return new ServiceProxyFactory(handler =>
                new ExtendedServiceRemotingClientFactory(
                    new FabricTransportServiceRemotingClientFactory(new FabricTransportRemotingSettings()
                    {
                        OperationTimeout = TimeSpan.FromMinutes(60)
                    }),
                    _customHeadersProvider)
                {
                    AfterSendRequestResponseAsync = responseInfo =>
                    {
                        if (responseInfo.Exception == null) return Task.CompletedTask;
                        try
                        {
                            responseInfo.Exception.Data.Add("IsRMAErrorLogged", true);
                            var logger = new LoggerFactory().CreateLogger(GetType());
                            switch (responseInfo.Exception)
                            {
                                case PermissionException permissionException:
                                case BusinessException businessException:
                                    //DO not log business/permissions exceptions
                                    break;
                                case AggregateException aggregateException:
                                    {
                                        foreach (var innerError in aggregateException.InnerExceptions)
                                        {
                                            logger.LogError(ServiceFabricEvent.Exception, innerError, innerError.Message);
                                        }
                                        break;
                                    }
                                default:
                                    logger.LogError(ServiceFabricEvent.Exception, responseInfo.Exception, responseInfo.Exception.Message);
                                    break;
                            }
                        }
                        catch
                        {
                            Debug.WriteLine(responseInfo.Exception.Message);
                        }
                        return Task.CompletedTask;
                    }
                });
        }

        /// <inheritdoc />
        /// <summary>
        ///     Create an instance of <see cref="Microsoft.ServiceFabric.Actors.Client.ActorProxyFactory" /> with built-in
        ///     tracing and logging
        /// </summary>
        /// <returns>
        ///     An instance of <see cref="Microsoft.ServiceFabric.Actors.Client.ActorProxyFactory" /> with built-in tracing
        ///     and logging
        /// </returns>
        public IActorProxyFactory CreateActorProxyFactory()
        {
            return new ActorProxyFactory(handler =>
                new ExtendedServiceRemotingClientFactory(
                    new FabricTransportActorRemotingClientFactory(handler), _customHeadersProvider));
        }
    }
}