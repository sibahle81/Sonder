using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;
using ServiceFabric.Remoting.CustomHeaders;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Services.Document.AutoProcessing
{
    /// <summary>
    /// Listens on mcc.scan.documentautoindex,
    /// forwards the whole batch of references to the service.
    /// </summary>
    public class DocumentAutoIndexListener :
        ServiceBusQueueStatelessService<DocumentAutoIndexMessage>,
        IDocumentAutoIndexListener
    {
        public const string QueueName = "mcc.scan.documentautoindex";

        private readonly IUserService _userService;
        private readonly IDocumentAutoProcessingService _autoProcessor;

        public DocumentAutoIndexListener(
            StatelessServiceContext context,
            IUserService userService,
            IDocumentAutoProcessingService autoProcessor)
            : base(context, QueueName)
        {
            _userService = userService;
            _autoProcessor = autoProcessor;
        }

        public override async Task ReceiveMessageAsync(
            DocumentAutoIndexMessage documentAutoIndexMessage,
            CancellationToken cancellationToken)
        {
            await ImpersonateUser(SystemSettings.SystemUserAccount);

            // façade expects a list (one e-mail ⇒ one message)
            await _autoProcessor.IndexDocuments(documentAutoIndexMessage);
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
