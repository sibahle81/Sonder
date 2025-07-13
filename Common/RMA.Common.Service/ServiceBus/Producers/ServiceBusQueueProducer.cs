using CommonServiceLocator;
using Microsoft.ServiceBus.Messaging;
using Newtonsoft.Json;
using RMA.Common.Entities;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Common.Service.ServiceBus.Producers
{
    public class ServiceBusQueueProducer<TMessage>
        where TMessage : ServiceBusMessageBase
    {
        public bool Enabled { get; }
        public string ConnectionString { get; }
        public string QueueName { get; }
        protected string EnvironmentName { get; }
        private static bool UnitTestMode
        {
            get
            {
                string processName = Process.GetCurrentProcess().ProcessName;
                return processName == "VSTestHost"
                       || processName.StartsWith("vstest.executionengine")
                       || processName.StartsWith("QTAgent");
            }
        }

        protected QueueClient ServiceBusClient { get; }

        public ServiceBusQueueProducer(string queueName)
        {
            EnvironmentName = Environment.GetEnvironmentVariable("EnvName");
            QueueName = $"{EnvironmentName}{queueName}";
            ConnectionString = Environment.GetEnvironmentVariable("SBConnectionString");
            Enabled = true;

            if (Enabled && !UnitTestMode && ConnectionString != null)
            {
                ServiceBusClient = QueueClient.CreateFromConnectionString(ConnectionString, QueueName);
            }
        }

        /// <summary>
        /// Synchronously publishes a message to Service Bus, optionally specifying a session ID.
        /// </summary>
        public virtual void PublishMessage(
            TMessage message,
            string sessionId = null,
            DateTime? enqueueDateTime = null)
        {
            if (message == null) throw new ArgumentNullException(nameof(message), "message is null");
            if (!Enabled || UnitTestMode)
            {
                SendMessageDirectlyToConsumer(message);
                return;
            }

            if (RmaIdentity.IsAuthenticated)
                message.ImpersonateUser = RmaIdentity.Username;

            var json = JsonConvert.SerializeObject(message);
            var bodyBytes = Encoding.UTF8.GetBytes(json);

            // Classic using-blocks instead of C# 10 using declarations
            using (var stream = new MemoryStream(bodyBytes, writable: false))
            {
                using (var brokeredMessage = new BrokeredMessage(stream))
                {
                    brokeredMessage.ContentType = "application/json";
                    brokeredMessage.MessageId = message.MessageId;
                    brokeredMessage.Properties.Add("SendingApplication", $"{EnvironmentName}MCC");
                    brokeredMessage.Properties.Add("SendingUser", RmaIdentity.Username);

                    if (!string.IsNullOrEmpty(sessionId))
                        brokeredMessage.SessionId = sessionId;

                    if (enqueueDateTime.HasValue)
                        brokeredMessage.ScheduledEnqueueTimeUtc = enqueueDateTime.Value.ToUniversalTime();

                    ServiceBusClient.Send(brokeredMessage);
                }
            }
        }

        /// <summary>
        /// Asynchronously publishes a message to Service Bus, optionally specifying a session ID.
        /// </summary>
        public virtual async Task PublishMessageAsync(
            TMessage message,
            string sessionId = null,
            DateTime? enqueueDateTime = null)
        {
            if (message == null) throw new ArgumentNullException(nameof(message), "message is null");
            if (!Enabled || UnitTestMode)
            {
                SendMessageDirectlyToConsumer(message);
                return;
            }

            if (string.IsNullOrEmpty(message.ImpersonateUser) && RmaIdentity.IsAuthenticated)
                message.ImpersonateUser = RmaIdentity.Username;

            var json = JsonConvert.SerializeObject(message);
            var bodyBytes = Encoding.UTF8.GetBytes(json);

            // Classic using-blocks
            using (var stream = new MemoryStream(bodyBytes, writable: false))
            {
                using (var brokeredMessage = new BrokeredMessage(stream))
                {
                    brokeredMessage.ContentType = "application/json";
                    brokeredMessage.MessageId = message.MessageId;
                    brokeredMessage.Properties.Add("SendingApplication", $"{EnvironmentName}MCC");
                    brokeredMessage.Properties.Add("SendingUser", RmaIdentity.Username);

                    if (!string.IsNullOrEmpty(sessionId))
                        brokeredMessage.SessionId = sessionId;

                    if (enqueueDateTime.HasValue)
                        brokeredMessage.ScheduledEnqueueTimeUtc = enqueueDateTime.Value.ToUniversalTime();

                    await ServiceBusClient.SendAsync(brokeredMessage);
                }
            }
        }

        /// <summary>
        /// Publishes with extra properties, optionally specifying a session ID.
        /// </summary>
        public virtual async Task PublishMessageWithAdditionalPropertiesAsync(
            TMessage message,
            string sessionId = null,
            DateTime? enqueueDateTime = null,
            Dictionary<string, string> messageProperties = null)
        {
            if (message == null) throw new ArgumentNullException(nameof(message), "message is null");
            if (!Enabled || UnitTestMode)
            {
                SendMessageDirectlyToConsumer(message);
                return;
            }

            if (string.IsNullOrEmpty(message.ImpersonateUser) && RmaIdentity.IsAuthenticated)
                message.ImpersonateUser = RmaIdentity.Username;

            var json = JsonConvert.SerializeObject(message);
            var bodyBytes = Encoding.UTF8.GetBytes(json);

            // Classic using-blocks
            using (var stream = new MemoryStream(bodyBytes, writable: false))
            {
                using (var brokeredMessage = new BrokeredMessage(stream))
                {
                    brokeredMessage.ContentType = "application/json";
                    brokeredMessage.MessageId = message.MessageId;
                    brokeredMessage.Properties.Add("SendingApplication", $"{EnvironmentName}MCC");
                    brokeredMessage.Properties.Add("SendingUser", RmaIdentity.Username);

                    if (messageProperties?.Count > 0)
                        foreach (var kv in messageProperties)
                            brokeredMessage.Properties.Add(kv.Key, kv.Value);

                    if (!string.IsNullOrEmpty(sessionId))
                        brokeredMessage.SessionId = sessionId;

                    if (enqueueDateTime.HasValue)
                        brokeredMessage.ScheduledEnqueueTimeUtc = enqueueDateTime.Value.ToUniversalTime();

                    await ServiceBusClient.SendAsync(brokeredMessage);
                }
            }
        }

        protected virtual void SendMessageDirectlyToConsumer(TMessage message)
        {
            // no-op for local execution
        }
    }

    public class ServiceBusQueueProducer<TMessage, TConsumer> : ServiceBusQueueProducer<TMessage>
        where TMessage : ServiceBusMessageBase
        where TConsumer : ServiceBusStatelessService<TMessage>
    {
        public ServiceBusQueueProducer(string queueName) : base(queueName) { }

        protected override void SendMessageDirectlyToConsumer(TMessage message)
        {
            var processor = ServiceLocator.Current.GetInstance<TConsumer>();
            processor.ReceiveMessageAsync(message, CancellationToken.None).RunSynchronously();
        }
    }
}
