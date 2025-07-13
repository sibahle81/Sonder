using Azure.Identity;
using Microsoft.Graph;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Integrations.Contracts.Interfaces.Exchange;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Services.Document.AutoProcessing;
using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;

namespace RMA.Service.Integrations.Services.Exchange
{
    /// <summary>Service that polls Exchange; posts one queue-message per e-mail.</summary>
    public class ExchangeMonitorService : RemotingStatelessService, IExchangeMonitorService
    {
        private readonly ServiceBusQueueProducer<DocumentDownloadMessage, DocumentDownloadListener> _downloadProducer;
        private readonly IMailboxConfigurationService _mailboxConfigurationService;
        private readonly IConfigurationService _configurationService;

        private GraphServiceClient _graphClient;
        private TimeSpan _pollInterval;
        private int _pageSize;

        public ExchangeMonitorService(
            StatelessServiceContext context,
            IConfigurationService configurationService,
            IMailboxConfigurationService mailboxConfigService)
            : base(context)
        {
            _configurationService = configurationService;
            _mailboxConfigurationService = mailboxConfigService;
            _downloadProducer = new ServiceBusQueueProducer<DocumentDownloadMessage, DocumentDownloadListener>(
                                               DocumentDownloadListener.QueueName);
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            var clientId = await _configurationService.GetModuleSetting(SystemSettings.AzureAdClientId);
            var clientSecret = await _configurationService.GetModuleSetting(SystemSettings.AzureAdClientSecret);
            var tenantId = await _configurationService.GetModuleSetting(SystemSettings.AzureAdTenantId);
            _graphClient = new GraphServiceClient(new ClientSecretCredential(tenantId, clientId, clientSecret));

            var rawInterval = await _configurationService.GetModuleSetting(SystemSettings.ExchangeMonitorPollInterval) ?? "5";
            _pollInterval = rawInterval.Contains(":") || rawInterval.Contains(".")
                              ? TimeSpan.Parse(rawInterval)
                              : TimeSpan.FromMinutes(int.Parse(rawInterval));

            var rawPageSize = await _configurationService.GetModuleSetting(SystemSettings.ExchangeMonitorPageSize);
            _pageSize = int.TryParse(rawPageSize, out var ps) ? ps : 20;

            while (!cancellationToken.IsCancellationRequested)
            {
                foreach (var mb in await _mailboxConfigurationService.GetMailboxConfigurations())
                {
                    var messages = await _graphClient.Users[mb.MailboxAddress].Messages.GetAsync(req =>
                    {
                        req.QueryParameters.Expand = new[] { "attachments" };
                        req.QueryParameters.Select = new[] { "subject", "body", "hasAttachments", "isRead" };
                        req.QueryParameters.Filter = "hasAttachments eq true and isRead eq false";
                        req.QueryParameters.Top = _pageSize;
                    }, cancellationToken);

                    if (messages?.Value == null) continue;

                    foreach (var mail in messages.Value)
                    {
                        var downloadMsg = new DocumentDownloadMessage
                        {
                            BatchId = Guid.NewGuid(),
                            MailboxAddress = mb.MailboxAddress,
                            GraphMessageId = mail.Id,
                            EmailSubject = mail.Subject,
                            EmailBody = mail.Body?.Content,
                            SystemName = mb.DocumentSystemName.ToString(),

                            // FILTER:  skip inline items (banners / icons / pixels)
                            Attachments = mail.Attachments
                                              .OfType<Microsoft.Graph.Models.FileAttachment>()
                                              .Where(a => a.IsInline != true &&
                                                          !string.IsNullOrEmpty(a.Name))
                                              .Select(a => new AttachmentMeta
                                              {
                                                  AttachmentId = a.Id,
                                                  FileName = a.Name,
                                                  ContentType = a.ContentType
                                              })
                                              .ToList()
                        };

                        // If the e-mail has *only* inline resources, skip the whole cycle.
                        if (downloadMsg.Attachments.Count == 0) continue;

                        try
                        {
                            await _downloadProducer.PublishMessageAsync(downloadMsg);
                            await _graphClient.Users[mb.MailboxAddress]
                                              .Messages[mail.Id]
                                              .PatchAsync(new Microsoft.Graph.Models.Message { IsRead = true },
                                                          null, cancellationToken);
                        }
                        catch
                        {
                            // leave mail unread – handled next poll
                        }
                    }
                }

                await Task.Delay(_pollInterval, cancellationToken);
            }
        }
    }
}
