using Azure.Identity;
using Microsoft.Graph;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities.BlobStorage;
using RMA.Service.Integrations.Contracts.Interfaces.AzureBlob;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;
using ServiceFabric.Remoting.CustomHeaders;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Services.Document.AutoProcessing
{
    /// <summary>
    /// Downloads each attachment for an e-mail, splits multi-doc files,
    /// stores parts in Blob Storage and fires a single Auto-Index message.
    /// </summary>
    public class DocumentSaveListener
        : ServiceBusQueueStatelessService<DocumentSaveMessage>,
          IDocumentSaveListener
    {
        public const string QueueName = "mcc.scan.documentsave";

        private readonly IBinaryStorageService _blobStorageService;
        private readonly IUserService _userService;
        private readonly IConfigurationService _configurationService;
        private readonly IDocumentSplitterService _documentSplitterService;
        private GraphServiceClient _graphClient;
        private readonly SemaphoreSlim _graphInit = new SemaphoreSlim(1, 1);

        public DocumentSaveListener(
            StatelessServiceContext context,
            IBinaryStorageService blobStorageService,
            IUserService userService,
            IConfigurationService configurationService,
            IDocumentSplitterService documentSplitterService)
            : base(context, QueueName)
        {
            _blobStorageService = blobStorageService;
            _userService = userService;
            _configurationService = configurationService;
            _documentSplitterService = documentSplitterService;
        }

        public override async Task ReceiveMessageAsync(DocumentSaveMessage message, CancellationToken cancellationToken)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }

            await ImpersonateUser(SystemSettings.SystemUserAccount);

            var graph = await GetGraphAsync(cancellationToken);

            var docs = new List<DocumentReferenceItem>();

            // pull *each* attachment, split if needed, store, collect URIs
            foreach (var meta in message.Attachments)
            {
                var att = await graph.Users[message.MailboxAddress]
                                     .Messages[message.GraphMessageId]
                                     .Attachments[meta.AttachmentId]
                                     .GetAsync(null, cancellationToken) as Microsoft.Graph.Models.FileAttachment;

                if (att?.ContentBytes == null || att.ContentBytes.Length == 0) continue;

                var parts = await _documentSplitterService.Split(att.ContentBytes, meta.FileName, meta.ContentType);

                foreach (var part in parts)
                {
                    var uri = await _blobStorageService.SaveDocument(new DocumentEntry
                    {
                        FileName = part.FileName,
                        Data = part.Data,
                        SystemName = message.SystemName
                    });

                    docs.Add(new DocumentReferenceItem
                    {
                        BlobUri = uri,
                        FileName = part.FileName
                    });
                }
            }

            var indexMsg = new DocumentAutoIndexMessage
            {
                BatchId = message.BatchId,
                Docs = docs,
                SystemName = message.SystemName,
                EmailSubject = message.EmailSubject,
                EmailBody = message.EmailBody
            };

            var producer = new ServiceBusQueueProducer<DocumentAutoIndexMessage, DocumentAutoIndexListener>(
                               DocumentAutoIndexListener.QueueName);

            await producer.PublishMessageAsync(indexMsg);
        }

        private async Task<GraphServiceClient> GetGraphAsync(CancellationToken ct)
        {
            if (_graphClient != null) return _graphClient;

            await _graphInit.WaitAsync(ct);
            try
            {
                if (_graphClient == null)
                {
                    var cid = await _configurationService.GetModuleSetting(SystemSettings.AzureAdClientId);
                    var csec = await _configurationService.GetModuleSetting(SystemSettings.AzureAdClientSecret);
                    var ten = await _configurationService.GetModuleSetting(SystemSettings.AzureAdTenantId);
                    _graphClient = new GraphServiceClient(new ClientSecretCredential(ten, cid, csec));
                }
            }
            finally { _graphInit.Release(); }

            return _graphClient;
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
