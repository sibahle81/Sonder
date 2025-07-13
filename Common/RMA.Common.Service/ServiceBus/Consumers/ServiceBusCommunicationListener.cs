using Microsoft.ServiceBus.Messaging;
using Microsoft.ServiceFabric.Services.Communication.Runtime;

using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;

using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Common.Service.ServiceBus.Consumers
{
    /// <summary>
    /// Abstract base implementation for <see cref="ICommunicationListener"/> connected to ServiceBus
    /// </summary>
    public abstract class ServiceBusCommunicationListener<TMessage> : ICommunicationListener, IDisposable where TMessage : ServiceBusMessageBase
    {
        protected ServiceBusStatelessService<TMessage> StatelessService { get; }

        private readonly CancellationTokenSource _stopProcessingMessageTokenSource;

        //prevents aborts during the processing of a message
        protected ManualResetEvent ProcessingMessage { get; } = new ManualResetEvent(true);

        /// <summary>
        /// When <see cref="CancellationToken.IsCancellationRequested"/> is true, this indicates that either <see cref="CloseAsync"/> 
        /// or <see cref="Abort"/> was called.
        /// </summary>
        protected CancellationToken StopProcessingMessageToken { get; }

        /// <summary>
        /// Creates a new instance.
        /// </summary>
        protected ServiceBusCommunicationListener(ServiceBusStatelessService<TMessage> serviceFabricService)
        {
            StatelessService = serviceFabricService;
            _stopProcessingMessageTokenSource = new CancellationTokenSource();
            StopProcessingMessageToken = _stopProcessingMessageTokenSource.Token;
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
        public abstract Task<string> OpenAsync(CancellationToken cancellationToken);

        /// <summary>
        /// This method causes the communication listener to close. Close is a terminal state and 
        ///             this method allows the communication listener to transition to this state in a
        ///             graceful manner.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>
        /// A <see cref="T:System.Threading.Tasks.Task">Task</see> that represents outstanding operation.
        /// </returns>
        public Task CloseAsync(CancellationToken cancellationToken)
        {
            _stopProcessingMessageTokenSource.Cancel();
            //Wait for Message processing to complete..
            ProcessingMessage.WaitOne();
            ProcessingMessage.Dispose();
            return CloseImplAsync(cancellationToken);
        }

        /// <summary>
        /// This method causes the communication listener to close. Close is a terminal state and
        ///             this method causes the transition to close ungracefully. Any outstanding operations
        ///             (including close) should be canceled when this method is called.
        /// </summary>
        public virtual void Abort()
        {
            Dispose();
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
        protected virtual Task CloseImplAsync(CancellationToken cancellationToken)
        {
            return Task.FromResult(true);
        }

        /// <summary>
        /// Will pass an incoming message to the <see cref="Receiver"/> for processing.
        /// </summary>
        /// <param name="messageSession">Contains the MessageSession when sessions are enabled.</param>
        /// <param name="message"></param>
        public virtual async Task ReceiveMessageAsync(BrokeredMessage message, MessageSession messageSession)
        {
            try
            {
                ProcessingMessage.Reset();

                string messageData = await new StreamReader(message?.GetBody<Stream>()).ReadToEndAsync();
                var messageObject = JsonConvert.DeserializeObject<TMessage>(messageData);

                await StatelessService.ReceiveMessageAsync(messageObject, StopProcessingMessageToken);

                if (StatelessService.AutoComplete)
                {
                    await message.CompleteAsync();
                }
            }
            catch (Exception ex)
            {
                if (!HandleReceiveMessageError(message, ex))
                    throw;
            }
            finally
            {
                message?.Dispose();
                ProcessingMessage.Set();
            }
        }

        /// <summary>
        /// Called when an error is thrown from <see cref="ReceiveMessageAsync"/>. Return true if the error is handled. Return false to terminate the process.
        /// </summary>
        /// <param name="message"></param>
        /// <param name="ex"></param>
        protected virtual bool HandleReceiveMessageError(BrokeredMessage message, Exception ex)
        {
            if (message == null)
            {
                ex.LogException();
                return true;
            }

            //catch all to avoid process crash.
            try
            {
                var brokeredMessage = JsonConvert.SerializeObject(message);
                var messageTemplate = $"HandleReceiveMessageError BrokeredMessage| {brokeredMessage}";
                ex.LogException(messageTemplate);
            }
            catch (Exception e)
            {
                e.LogException();
            }

            message.Abandon();

            //assuming overriding code handles exceptions.
            return true;
        }

        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
        /// </summary>
        public void Dispose()
        {
            GC.SuppressFinalize(this);
            Dispose(true);
        }

        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
        /// </summary>
        protected virtual void Dispose(bool disposing)
        {
            if (!disposing) return;
            ProcessingMessage.Set();
            ProcessingMessage.Dispose();
            _stopProcessingMessageTokenSource.Cancel();
            _stopProcessingMessageTokenSource.Dispose();
        }
    }
    public class SessionHandlerFactory<TMessage> : IMessageSessionAsyncHandlerFactory where TMessage : ServiceBusMessageBase
    {
        private readonly ServiceBusCommunicationListener<TMessage> _listener;

        public SessionHandlerFactory(ServiceBusCommunicationListener<TMessage> listener)
        {
            _listener = listener;
        }

        public IMessageSessionAsyncHandler CreateInstance(MessageSession session, BrokeredMessage message)
        {
            return new SessionHandler<TMessage>(_listener);
        }

        public void DisposeInstance(IMessageSessionAsyncHandler handler)
        {
        }
    }

    public class SessionHandler<TMessage> : MessageSessionAsyncHandler where TMessage : ServiceBusMessageBase
    {
        private readonly ServiceBusCommunicationListener<TMessage> _listener;

        public SessionHandler(ServiceBusCommunicationListener<TMessage> listener)
        {
            _listener = listener;
        }
        protected override Task OnMessageAsync(MessageSession session, BrokeredMessage message)
        {
            return _listener.ReceiveMessageAsync(message, session);
        }
    }
}
