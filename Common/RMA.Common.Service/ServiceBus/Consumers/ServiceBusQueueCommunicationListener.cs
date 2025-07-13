using Microsoft.ServiceBus.Messaging;
using Microsoft.ServiceFabric.Services.Communication.Runtime;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;

using System;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Common.Service.ServiceBus.Consumers
{
    /// <summary>
    /// Implementation of <see cref="ICommunicationListener"/> that listens to a Service Bus Queue.
    /// </summary>
    public class ServiceBusQueueCommunicationListener<TMessage> : ServiceBusCommunicationListener<TMessage> where TMessage : ServiceBusMessageBase
    {
        protected new ServiceBusQueueStatelessService<TMessage> StatelessService => (ServiceBusQueueStatelessService<TMessage>)base.StatelessService;

        /// <summary>
        /// Gets the Service Bus Queue client.
        /// </summary>
        protected QueueClient ServiceBusClient { get; private set; }

        /// <summary>
        /// Creates a new instance, using the init parameters of a <see cref="StatefulService"/>
        /// </summary>
        public ServiceBusQueueCommunicationListener(ServiceBusQueueStatelessService<TMessage> serviceFabricService)
            : base(serviceFabricService)
        {
        }

        /// <summary>
        /// This method causes the communication listener to be opened. Once the Open
        ///             completes, the communication listener becomes usable - accepts and sends messages.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>
        /// A <see cref="T:System.Threading.Tasks.Task">Task</see> that represents outstanding operation. The result of the Task is
        ///             the endpoint string.
        /// </returns>
        public override Task<string> OpenAsync(CancellationToken cancellationToken)
        {
            //use receive url:
            ServiceBusClient = string.IsNullOrWhiteSpace(StatelessService.ServiceBusQueueName)
                ? QueueClient.CreateFromConnectionString(StatelessService.ConnectionString, StatelessService.ReceiveMode)
                : QueueClient.CreateFromConnectionString(StatelessService.ConnectionString, StatelessService.ServiceBusQueueName, StatelessService.ReceiveMode);

            if (StatelessService.MessagePrefetchCount > 0)
            {
                ServiceBusClient.PrefetchCount = StatelessService.MessagePrefetchCount;
            }

            if (Environment.GetEnvironmentVariable("EnvName") != "Local.")
            {
                if (StatelessService.RequireSessions)
                {
                    ListenForSessionMessages();
                }
                else
                {
                    ListenForMessages();
                }
            }
            Thread.Yield();

            //create send url:
            string uri = StatelessService.ConnectionString;
            return Task.FromResult(uri);
        }

        protected override bool HandleReceiveMessageError(BrokeredMessage message, Exception ex)
        {
            if (message == null) throw new ArgumentNullException(nameof(message), "message is null");
            ex?.LogApiException();
            int resubmitCount = 1;

            if (message.Properties.ContainsKey("ResubmitCount"))
            {
                resubmitCount = (int)(message.Properties["ResubmitCount"] ?? 0) + 1;
            }

            if (resubmitCount > StatelessService.MaxDeliveryAttempts)
            {
                ServiceBusClient.DeadLetter(message.LockToken, "MaxDeliveryCountExceeded", ex?.Message);
            }
            else
            {
                BrokeredMessage clone = message.Clone();
                if (clone.Properties.ContainsKey("ResubmitCount"))
                {
                    clone.Properties["ResubmitCount"] = ++resubmitCount;
                }
                else
                {
                    clone.Properties.Add("ResubmitCount", ++resubmitCount);
                }

                clone.ScheduledEnqueueTimeUtc = DateTimeHelper.UtcNow.AddSeconds(10 * resubmitCount);
                ServiceBusClient.Send(clone);

                if (StatelessService.AutoComplete)
                {
                    message.Complete();
                }
            }

            return true;
        }



        /// <summary>
        /// This method causes the communication listener to close. Close is a terminal state and 
        ///             this method allows the communication listener to transition to this state in a
        ///             graceful manner.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>
        /// A <see cref="T:System.Threading.Tasks.Task">Task</see> that represents outstanding operation.
        /// </returns>
        protected override async Task CloseImplAsync(CancellationToken cancellationToken)
        {
            await ServiceBusClient.CloseAsync();
        }

        /// <summary>
        /// Starts listening for messages on the configured Service Bus Queue.
        /// </summary>
        protected void ListenForMessages()
        {
            var options = new OnMessageOptions();
            if (StatelessService.AutoRenewTimeout.HasValue)
            {
                options.AutoRenewTimeout = StatelessService.AutoRenewTimeout.Value;
            }
            if (StatelessService.MaxConcurrentCalls.HasValue)
            {
                options.MaxConcurrentCalls = StatelessService.MaxConcurrentCalls.Value;
            }
            ServiceBusClient.OnMessageAsync(message => ReceiveMessageAsync(message, null), options);
        }

        /// <summary>
        /// Starts listening for session messages on the configured Service Bus Queue.
        /// </summary>
        protected void ListenForSessionMessages()
        {
            var options = new SessionHandlerOptions();
            if (StatelessService.AutoRenewTimeout.HasValue)
            {
                options.AutoRenewTimeout = StatelessService.AutoRenewTimeout.Value;
            }
            if (StatelessService.MaxConcurrentSessions.HasValue)
            {
                options.MaxConcurrentSessions = StatelessService.MaxConcurrentSessions.Value;
            }
            ServiceBusClient.RegisterSessionHandlerFactory(new SessionHandlerFactory<TMessage>(this), options);
        }
    }
}
