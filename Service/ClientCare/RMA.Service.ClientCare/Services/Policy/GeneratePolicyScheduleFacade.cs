using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Fabric;
using System.Threading.Tasks;

using FormLetterResponse = RMA.Service.Admin.MasterDataManager.Contracts.Entities.FormLetterResponse;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class GeneratePolicyScheduleFacade : RemotingStatelessService, IGeneratePolicyScheduleService
    {

        private readonly ISendEmailService _sendEmailService;
        private readonly IConfigurationService _configurationService;
        private readonly IRepresentativeService _representativeService;

        public GeneratePolicyScheduleFacade(StatelessServiceContext context
            , ISendEmailService sendEmailService
            , IConfigurationService configurationService
            , IRepresentativeService representativeService) : base(context)
        {
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _representativeService = representativeService;

            //Task.Run(() => this.SetupPolicyScheduleVariables()).Wait();
        }

        public Task<FormLetterResponse> GeneratePolicySchedule(int policyId)
        {
            throw new NotImplementedException();
        }

        public Task SendPolicyDocuments(int wizardId, Case caseModel)
        {
            throw new NotImplementedException();
        }

        public Task SendSchedule(SendScheduleRequest request)
        {
            throw new NotImplementedException();
        }
    }
}