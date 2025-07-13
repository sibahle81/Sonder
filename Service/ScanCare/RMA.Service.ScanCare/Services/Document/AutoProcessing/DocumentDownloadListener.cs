using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;
using ServiceFabric.Remoting.CustomHeaders;
using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Services.Document.AutoProcessing
{
    /// <summary>
    /// Listens on *document-download* queue, repackages the entire e-mail
    /// (all attachment metadata) into a single save-request, then forwards it.
    /// </summary>
    public class DocumentDownloadListener
        : ServiceBusQueueStatelessService<DocumentDownloadMessage>,
          IDocumentDownloadListener
    {
        public const string QueueName = "mcc.scan.documentdownload";

        private readonly IUserService _userService;
        private readonly ServiceBusQueueProducer<DocumentSaveMessage, DocumentSaveListener> _saveProducer =
            new ServiceBusQueueProducer<DocumentSaveMessage, DocumentSaveListener>(DocumentSaveListener.QueueName);

        public DocumentDownloadListener(StatelessServiceContext ctx, IUserService userService)
            : base(ctx, QueueName) => _userService = userService;

        public override async Task ReceiveMessageAsync(DocumentDownloadMessage message, CancellationToken cancellationToken)
        {
            if(message == null) throw new ArgumentNullException(nameof(message)); 
            await ImpersonateUser(SystemSettings.SystemUserAccount);

            // create a single save-message that contains all attachments
            var saveMsg = new DocumentSaveMessage
            {
                BatchId = message.BatchId,
                MailboxAddress = message.MailboxAddress,
                GraphMessageId = message.GraphMessageId,
                Attachments = message.Attachments,
                EmailSubject = message.EmailSubject,
                EmailBody = message.EmailBody,
                SystemName = message.SystemName
            };

            await _saveProducer.PublishMessageAsync(saveMsg);
        }


        // Impersonates the specified user to set the remoting context.
        // If no username is provided, the system user account is used.
        protected override async Task ImpersonateUser(string username)
        {
            try
            {
                // Retrieve user impersonation info; use system account if username is empty.
                var userInfo = await _userService.GetUserImpersonationInfo(
                    !string.IsNullOrEmpty(username) ? username : SystemSettings.SystemUserAccount);

                // Set the remoting context with the retrieved user info.
                userInfo.SetRemotingContext();

                // If using the system account, add a super-permission claim to the remoting context.
                if (string.IsNullOrEmpty(username))
                {
                    RemotingContext.SetData($"{RemotingContext.Keys.Count() + 1}_permission", "SuperMagicSecretClaim");
                }
            }
            catch (TechnicalException ex)
            {
                ex.LogException();
            }
        }
    }
}
