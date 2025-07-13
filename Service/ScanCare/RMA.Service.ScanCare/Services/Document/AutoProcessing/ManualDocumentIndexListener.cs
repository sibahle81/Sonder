// -----------------------------------------------------------------------------
//  Listener ‒ ManualDocumentIndexListener.cs  (ScanCare.Services.Document.AutoProcessing)
// -----------------------------------------------------------------------------
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing;   // assumed workflow facade
using ServiceFabric.Remoting.CustomHeaders;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.ScanCare.Services.Document.AutoProcessing
{
    /// <summary>
    /// Consumes <see cref="ManualDocumentIndexMessage"/> items and forwards them
    /// to the manual-indexing workflow/service.
    /// </summary>
    public class ManualDocumentIndexListener : ServiceBusQueueStatelessService<ManualDocumentIndexMessage>, IManualDocumentIndexListener                                
    {
        public const string QueueName = "mcc.scan.manualdocumentindex";

        private readonly IUserService _userService;

        public ManualDocumentIndexListener(
            StatelessServiceContext context, IUserService userService)
            : base(context, QueueName)
        {
            _userService = userService;
        }

        public override async Task ReceiveMessageAsync(ManualDocumentIndexMessage message, CancellationToken cancellationToken)
        {
            // always run under the System account to guarantee permissions
            await ImpersonateUser(SystemSettings.SystemUserAccount).ConfigureAwait(false);

            // TODO: fan-out into whatever manual-indexing workflow you host
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
