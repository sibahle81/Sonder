using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using ServiceFabric.Remoting.CustomHeaders;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyScheduleMessageListener : ServiceBusQueueStatelessService<PolicyScheduleMessage>, IPolicyScheduleMessageListener
    {
        private readonly IPolicyService _policyService;
        private readonly IGeneratePolicyDocumentService _generatePolicyDocumentService;
        private readonly IUserService _userService;

        public const string QueueName = "mcc.clc.genpolicysched";

        public PolicyScheduleMessageListener(StatelessServiceContext serviceContext,
            IPolicyService policyService,
            IGeneratePolicyDocumentService generatePolicyDocumentService,
            IUserService userService) : base(serviceContext, QueueName)
        {
            _policyService = policyService;
            _generatePolicyDocumentService = generatePolicyDocumentService;
            _userService = userService;
        }

        public override async Task ReceiveMessageAsync(PolicyScheduleMessage message, CancellationToken cancellationToken)
        {         
            Contract.Requires(message != null);  
            
          
            await ImpersonateUser(message.ImpersonateUser);
                  
            var policyModel = await _policyService.GetPolicy(message.PolicyId);

            if (policyModel != null)
            {
                if (message.ShouldRegenerateSchedule)
                {
                    await _policyService.DeletePolicyScheduleDocumentByPolicyId(policyModel.PolicyId);
                }

                await _generatePolicyDocumentService.CreatePolicyDocumentsIfNotExists(policyModel, null);
            }         
        }

        protected override async Task ImpersonateUser(string username)
        {
            try
            {
                // This process should not affect message processing
                var userInfo = await _userService.GetUserImpersonationInfo(!string.IsNullOrEmpty(username)
                    ? username
                    : SystemSettings.SystemUserAccount);
                userInfo.SetRemotingContext();

                if (string.IsNullOrEmpty(username))
                {
                    // Lets insert the supermagic claim here because we impersonated the system user
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
