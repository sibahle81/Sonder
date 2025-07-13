using CommonServiceLocator;

using Microsoft.ServiceBus.Messaging;

using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.Contracts;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Common.Service.ServiceBus.Producers
{
    public class ServiceBusTopicProducer<TMessage>
        where TMessage : ServiceBusMessageBase
    {
        public bool Enabled { get; }
        public string ConnectionString { get; }
        public string TopicName { get; }
        protected string EnvironmentName { get; private set; }

        private static bool UnitTestMode
        {
            get
            {
                string processName = Process.GetCurrentProcess().ProcessName;
                return processName == "VSTestHost"
                       || processName.StartsWith("vstest.executionengine") //it can be vstest.executionengine.x86 or vstest.executionengine.x86.clr20
                       || processName.StartsWith("QTAgent");   //QTAgent32 or QTAgent32_35
            }
        }

        /// <summary>
        /// Gets the Service Bus Subscription client.
        /// </summary>
        protected TopicClient TopicClient { get; }

        public ServiceBusTopicProducer(string topicName, string connectionString)
        {
            TopicName = $"{topicName}";

            ConnectionString = connectionString;

            /**Enabled = EnvironmentName != "Local."; **/
            Enabled = true;

            if (Enabled && !UnitTestMode)
            {
                TopicClient = TopicClient.CreateFromConnectionString(ConnectionString, TopicName);
            }
        }

        public virtual void PublishMessage(TMessage message, DateTime? enqueueDateTime = null, Dictionary<string, string> messageProperties = null)
        {
            Contract.Requires(message != null);
            if (Enabled && !UnitTestMode)
            {
                if (RmaIdentity.IsAuthenticated)
                {
                    message.ImpersonateUser = RmaIdentity.Username;
                }

                var jsonMessage = JsonConvert.SerializeObject(message);
                byte[] bytes = Encoding.UTF8.GetBytes(jsonMessage);
                using (var stream = new MemoryStream(bytes, writable: false))
                {
                    using (var brokeredMessage = new BrokeredMessage(stream))
                    {
                        brokeredMessage.ContentType = "application/json";
                        brokeredMessage.MessageId = message.MessageId;
                        brokeredMessage.Properties.Add("SendingApplication", $"{EnvironmentName}MCC");
                        brokeredMessage.Properties.Add("SendingUser", RmaIdentity.Username);

                        if (enqueueDateTime.HasValue)
                            brokeredMessage.ScheduledEnqueueTimeUtc = enqueueDateTime.Value.ToUniversalTime();

                        TopicClient.Send(brokeredMessage);
                    }
                }
            }
            else
            {
                SendMessageDirectlyToConsumer(message);
            }
        }

        protected virtual void SendMessageDirectlyToConsumer(TMessage message)
        {
            //DO nothing, we do not know the consumer
        }


        public virtual async Task PublishMessageAsync(TMessage message, DateTime? enqueueDateTime = null, Dictionary<string, string> messageProperties = null)
        {
            Contract.Requires(message != null);
            if (Enabled && !UnitTestMode)
            {
                if (RmaIdentity.IsAuthenticated)
                {
                    message.ImpersonateUser = RmaIdentity.Username;
                }

                var jsonMessage = JsonConvert.SerializeObject(message);
                byte[] bytes = Encoding.UTF8.GetBytes(jsonMessage);

                using (var stream = new MemoryStream(bytes, writable: false))
                {
                    using (var brokeredMessage = new BrokeredMessage(stream))
                    {
                        brokeredMessage.ContentType = "application/json";
                        brokeredMessage.MessageId = message.MessageId;
                        brokeredMessage.Properties.Add("SendingApplication", $"{EnvironmentName}MCC");
                        brokeredMessage.Properties.Add("SendingUser", RmaIdentity.Username);

                        if (messageProperties?.Count > 0)
                            AddMessageProperties(brokeredMessage, messageProperties);

                        if (enqueueDateTime.HasValue)
                            brokeredMessage.ScheduledEnqueueTimeUtc = enqueueDateTime.Value.ToUniversalTime();

                        await TopicClient.SendAsync(brokeredMessage);
                    }
                }
            }
            else
            {
                SendMessageDirectlyToConsumer(message);
            }
        }

        private void AddMessageProperties(BrokeredMessage brokeredMessage, Dictionary<string, string> messageProperties)
        {
            foreach (KeyValuePair<string, string> messageProperty in messageProperties)
            {
                brokeredMessage.Properties.Add(messageProperty.Key, messageProperty.Value);
            }
        }

    }

    public class ServiceBusTopicProducer<TMessage, TConsumer> : ServiceBusTopicProducer<TMessage>
        where TMessage : ServiceBusMessageBase
        where TConsumer : ServiceBusStatelessService<TMessage>
    {
        public ServiceBusTopicProducer(string topicName, string connectionString) : base(topicName, connectionString)
        {
        }

        protected override void SendMessageDirectlyToConsumer(TMessage message)
        {
            var processor = ServiceLocator.Current.GetInstance<TConsumer>();
            processor.ReceiveMessageAsync(message, CancellationToken.None).RunSynchronously();
        }
    }

}
