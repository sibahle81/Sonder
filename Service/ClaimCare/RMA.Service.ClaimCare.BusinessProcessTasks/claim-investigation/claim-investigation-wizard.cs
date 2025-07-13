using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

using Informant = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.Informant;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class ClaimInvestigationWizard : IWizardProcess
    {
        private readonly IClaimService _claimService;
        private readonly IEventService _eventService;
        private readonly IPolicyService _policyService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IWizardService _wizardService;
        private readonly IDocumentIndexService _documentIndexService;

        public ClaimInvestigationWizard(
                IClaimService claimService
              , IEventService eventService
              , IPolicyService policyService
              , IRolePlayerService rolePlayerService
              , IWizardService wizardService
              , IDocumentIndexService documentIndexService)
        {
            _claimService = claimService;
            _rolePlayerService = rolePlayerService;
            _eventService = eventService;
            _policyService = policyService;
            _wizardService = wizardService;
            _documentIndexService = documentIndexService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            const string newBeneficiary = "New Investigation";
            var result = CreateClaimInvestigation();
            result.personEventId = context.LinkedItemId;
            result.FraudulentCase = false;
            var personEvent = await _eventService.GetPersonEvent(context.LinkedItemId);

            var polices = await _policyService.GetPoliciesByRolePlayer(personEvent.InsuredLifeId);
            var isIndividual = false;

            foreach (var policy in polices)
            {
                isIndividual = await _policyService.CheckIfPolicyIsGroupOrIndividual(policy.PolicyId);
            }

            result.ClaimDocumentSet = await _claimService.GetDocumentSetName(personEvent.PersonEventDeathDetail.DeathType, isIndividual);
            var stepData = new ArrayList { result };
            return await context.CreateWizard(newBeneficiary, stepData);
        }

        private static ClaimInvestigation CreateClaimInvestigation()
        {
            return new ClaimInvestigation()
            {
                RolePlayer = new RolePlayer()
                {
                    Person = new Person(),
                    Informant = new Informant(),
                    HealthCareProvider = new HealthCareProviderModel(),
                    ForensicPathologist = new ForensicPathologist(),
                    FuneralParlor = new FuneralParlor(),
                    Undertaker = new Undertaker(),
                    BodyCollector = new BodyCollector()
                }
            };
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var claimInvestigationModel = context.Deserialize<ClaimInvestigation>(stepData[0].ToString());

            var personEvent = await _eventService.GetPersonEvent(wizard.LinkedItemId);

            await _claimService.UpdateInvestigationWorkFlow(personEvent.PersonEventId);

            await _claimService.UpdatePersonEventStatus(new PersonEventAction
            {
                ItemId = personEvent.PersonEventId,
                UserId = RMA.Common.Security.RmaIdentity.UserId,
                PersonEventStatus = claimInvestigationModel.FraudulentCase ? PersonEventStatusEnum.InvestigationsCompleted : PersonEventStatusEnum.Open,
                ItemType = ItemTypeEnum.PersonEvent.DisplayDescriptionAttributeValue(),
                FraudulentCase = claimInvestigationModel.FraudulentCase
            });
        }


        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context), "The provided context is null.");

            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var claimInvestigationModel = context.Deserialize<ClaimInvestigation>(stepData[0].ToString());

            var keys = new Dictionary<string, string>();
            keys.Add("ClaimInvestigation", claimInvestigationModel.personEventId.ToString());

            var overallSuccess = await _documentIndexService.HaveAllDocumentsBeenReceived(DocumentSetEnum.InvestigationDocuments, keys);
            var ruleResults = new List<RuleResult>();

            if (!overallSuccess)
            {
                var listMessgae = new List<string>();
                listMessgae.Add("Investigation document has not been uploaded");
                ruleResults.Add(new RuleResult()
                {
                    RuleName = "Document Rule",
                    Passed = false,
                    MessageList = listMessgae
                });
            }
            else
            {
                var listMessgae = new List<string>();
                listMessgae.Add("All Documents have been uploaded");
                ruleResults.Add(new RuleResult()
                {
                    RuleName = "Document Rule",
                    Passed = true,
                    MessageList = listMessgae
                });
            }

            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = overallSuccess,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            });

        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public  Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public  Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
