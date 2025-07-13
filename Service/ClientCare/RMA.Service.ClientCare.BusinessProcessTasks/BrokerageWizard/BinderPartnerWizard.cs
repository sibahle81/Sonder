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

namespace RMA.Service.ClientCare.BusinessProcessTasks.BrokerageWizard
{
    public class ManageBinderPartnerWizard : IWizardProcess
    {
        private readonly IBrokerageService _brokerageService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly ISerializerService _serializer;

        public ManageBinderPartnerWizard(IBrokerageService brokerageService, IDocumentGeneratorService documentGeneratorService, ISerializerService serializerService)
        {
            _brokerageService = brokerageService;
            _documentGeneratorService = documentGeneratorService;
            _serializer = serializerService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            var isNew = context?.LinkedItemId <= 0;

            var brokerage = new Brokerage { StartDate = DateTime.Now };
            brokerage.BrokerageType = BrokerageTypeEnum.BinderPartner;

            if (!isNew)
            {
                RmaIdentity.DemandPermission(Permissions.EditBrokerage);
                brokerage = await GetBrokerage(context);
            }
            else
            {
                var brokerCode = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.TemporaryBrokerage, "");
                brokerage.Code = brokerCode;

                RmaIdentity.DemandPermission(Permissions.AddBrokerage);
            }
            var stepData = new ArrayList() { brokerage };
            var wizardId = await AddWizard(context, stepData);
            return await Task.FromResult(wizardId);
        }

        private async Task<Brokerage> GetBrokerage(IWizardContext context)
        {
            return await _brokerageService.GetBrokerage(context.LinkedItemId);
        }

        private async Task<int> AddWizard(IWizardContext context, ArrayList stepData)
        {
            var isNew = context.LinkedItemId <= 0;

            var brokerage = stepData[0] as Brokerage;

            var label = !isNew
                ? $"Edit Binder Partner: {brokerage.Code}"
                : $"New Binder Partner: {brokerage.Code}";

            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var brokerage = context.Deserialize<Brokerage>(stepData[0].ToString());

            brokerage.IsAuthorised = true;
            await _brokerageService.EditBrokerage(brokerage);
            await _brokerageService.SendBrokerageWelcomeLetter(brokerage);
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var brokerage = context.Deserialize<Brokerage>(stepData[0].ToString());
            var representatives = brokerage.Representatives;

            var ruleResults = new List<RuleResult>();

            var companyValidations = await _brokerageService.ValidationCompany(brokerage.FspNumber, brokerage.RegNo);
            var representativeValidations = await _brokerageService.ValidateRepresentatives(brokerage.FspNumber, representatives);

            var passed = representativeValidations.Count == 0 && companyValidations.Count == 0;

            var ruleResult = new RuleResult
            {
                RuleName = "Company Registration",
                Passed = companyValidations.Count == 0,
                MessageList = companyValidations
            };
            ruleResults.Add(ruleResult);

            ruleResult = new RuleResult
            {
                RuleName = "Duplicate Representatives",
                Passed = representativeValidations.Count == 0,
                MessageList = representativeValidations
            };
            ruleResults.Add(ruleResult);

            var result = new RuleRequestResult()
            {
                OverallSuccess = passed,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            };
            return result;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }


        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            string name = string.Empty;
            try
            {
                var datain = JValue.Parse(data);
                var brokerage = _serializer.Deserialize<Brokerage>(datain[0].ToString());

                if (currentwizardname == null) { return string.Empty; }
                var newname = brokerage.Name;
                var oldname = currentwizardname.Split(':')[0];
                newname = string.IsNullOrEmpty(newname) ? "" : newname.Trim();
                name = oldname.Trim() + " : " + newname.Trim();

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
