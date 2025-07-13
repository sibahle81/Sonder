using Microsoft.Extensions.Logging;
using Microsoft.ServiceBus.Messaging;
using Microsoft.ServiceFabric.Services.Runtime;

using RMA.Common.Entities;
using RMA.Common.Service.Diagnostics.Serilog;

using Serilog;

using System;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

using ILogger = Microsoft.Extensions.Logging.ILogger;

namespace RMA.Common.Service.ServiceFabric
{
    public abstract class ServiceBusStatelessService<TMessage>
        : StatelessService
        where TMessage : ServiceBusMessageBase
    {
        protected ILogger Logger { get; }

        /// <summary>
        /// Gets a Service Bus connection string that should have only receive-rights.
        /// </summary>
        public string ConnectionString { get; protected set; }

        /// <summary>
        /// Indicates whether the Service Bus Queue or Subscription requires sessions.
        /// </summary>
        public bool RequireSessions { get; protected set; }

        /// <summary>
        /// Gets or sets the prefetch size when receiving Service Bus Messages. (Defaults to 0, which indicates no prefetch)
        /// Set to 20 times the total number of messages that a single receiver can process per second.
        /// </summary>
        public int MessagePrefetchCount { get; protected set; }

        /// <summary>
        /// Gets or sets the timeout for receiving a batch of Service Bus Messages. (Defaults to 30s)
        /// </summary>
        public TimeSpan ServerTimeout { get; protected set; } = TimeSpan.FromSeconds(30);

        /// <summary>
        /// Gets or sets the Service Bus client ReceiveMode. 
        /// </summary>
        public ReceiveMode ReceiveMode { get; protected set; } = ReceiveMode.PeekLock;

        /// <summary>
        /// Gets or sets the AutoRenewTimeout that will be passed to the <see cref="Receiver"/>. Can be null.
        /// </summary>
        public TimeSpan? AutoRenewTimeout { get; protected set; }

        /// <summary>
        /// (Ignored when using Sessions) Gets or sets the MaxConcurrentCalls that will be passed to the <see cref="Receiver"/>. Can be null. 
        /// </summary>
        public int? MaxConcurrentCalls { get; protected set; }

        /// <summary>
        /// (Ignored when not using Sessions) Gets or sets the MaxConcurrentSessions that will be passed to the <see cref="Receiver"/>. Can be null. 
        /// </summary>
        public int? MaxConcurrentSessions { get; protected set; }

        /// <summary>
        /// Indicates whether a batch of messages should be automatically completed after processing.
        /// </summary>
        public bool AutoComplete { get; protected set; }

        /// <summary>
        /// Indicates how many times the system must re-process a message before dead lettering it
        /// </summary>
        public int MaxDeliveryAttempts { get; protected set; }

        /// <summary>
        /// Indicates how long the system must wait between delivery attempts that fail, in seconds
        /// </summary>
        public int DelayBetweenDeliveryAttempts { get; protected set; }


        protected ServiceBusStatelessService(StatelessServiceContext serviceContext, string connectionString) : base(serviceContext)
        {
            ConnectionString = connectionString;
            DelayBetweenDeliveryAttempts = 10;
            MaxDeliveryAttempts = 10;

            AutoComplete = true;
            Logger = new LoggerFactory()
                .AddSerilog(Log.Logger.ForContext(new ServiceFabricEnricher(serviceContext)))
                .CreateLogger(GetType());
        }

        public abstract Task ReceiveMessageAsync(TMessage message, CancellationToken cancellationToken);

        protected abstract Task ImpersonateUser(string username);
    }
}
