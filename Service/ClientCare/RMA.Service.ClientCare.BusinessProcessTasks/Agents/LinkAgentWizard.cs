using Newtonsoft.Json.Linq;

using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.Agents
{
    public class LinkAgentWizard : IWizardProcess
    {
        private readonly IRepresentativeService _representativeService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly ISerializerService _serializer;

        public LinkAgentWizard(
            IRepresentativeService representativeService,
            IDocumentGeneratorService documentGeneratorService,
            ISerializerService serializerService
        )
        {
            _representativeService = representativeService;
            _documentGeneratorService = documentGeneratorService;
            _serializer = serializerService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            Representative rep;
            if (context.LinkedItemId <= 0)
            {
                RmaIdentity.DemandPermission(Permissions.AddRepresentative);
                var repCode = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.TemporaryRepresentative, "");
                rep = new Representative();
                rep.Code = repCode;
            }
            else
            {
                RmaIdentity.DemandPermission(Permissions.EditRepresentativeWizard);
                rep = await _representativeService.GetRepresentative(context.LinkedItemId);
            }
            var wizardId = await AddWizard(context, rep);
            return await Task.FromResult(wizardId);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var rep = context.Deserialize<LinkAgent>(stepData[0].ToString());
            await _representativeService.LinkRepresentative(rep);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var result = new RuleRequestResult()
            {
                OverallSuccess = true,
                RequestId = Guid.NewGuid(),
                RuleResults = new List<RuleResult>()
            };
            return Task.FromResult(result);
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        private async Task<int> AddWizard(IWizardContext context, Representative rep)
        {
            var stepData = new ArrayList() { rep };
            var label = $"Link Agent: {rep.Code}";
            return await context.CreateWizard(label, stepData);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            string name = string.Empty;
            try
            {
                var datain = JValue.Parse(data);
                var brokerage = _serializer.Deserialize<Representative>(datain[0].ToString());

                var newname = brokerage.Name;
                var oldname = currentwizardname?.Split(':')[0];
                name = oldname + " : " + newname;

            }
            catch (Exception ex)
            {
                ex.LogException();
            }
            return name;
        }

        public async Task UpdateStatus(IWizardContext context)
        {
            return;
        }

        public async Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return;
        }

        public async Task OnApprove(IWizardContext context)
        {
            return;
        }

        public async Task OnRequestForApproval(IWizardContext context)
        {
            return;
        }

        public async Task OnSaveStep(IWizardContext context)
        {
            return;
        }
        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
