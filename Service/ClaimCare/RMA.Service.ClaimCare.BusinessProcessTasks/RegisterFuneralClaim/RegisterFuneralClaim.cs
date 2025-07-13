using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;

namespace RMA.Service.ClaimCare.BusinessProcessTasks.RegisterFuneralClaim
{
    public class RegisterFuneralClaim : IWizardProcess
    {
        private readonly IEventService  _eventService;
        private readonly IDocumentGeneratorService _documentGeneratorService;

        private const string AddPermission = "Add Product";
        private const string EditPermission = "Edit Product";

        public RegisterFuneralClaim(
            IEventService eventService,
            IDocumentGeneratorService documentGeneratorService)
        {
            _eventService = eventService;
            _documentGeneratorService = documentGeneratorService;
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            PersonEvent personEvent;

            if (context.LinkedItemId <= 0)
            {
                RmaIdentity.DemandPermission(AddPermission);
                personEvent = new PersonEvent();
                var code = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Product, "");
                personEvent.CreatedDate = DateTimeHelper.SaNow.Date;
                personEvent.DateAuthorised = null;
                personEvent.PersonEventReferenceNumber = code;
            }
            else
            {
                RmaIdentity.DemandPermission(EditPermission);
                personEvent = await _eventService.GetPersonEvent(context.LinkedItemId);
            }

            var wizardId = await AddWizard(context, personEvent);

            return await Task.FromResult(wizardId);
        }

        private async Task<int> AddWizard(IWizardContext context, PersonEvent personEvent)
        {
            var stepData = new ArrayList()
            {
                personEvent
            };

            var label = personEvent.PersonEventId == 0
                ? $"New Product: '{personEvent.PersonEventReferenceNumber}'"
                : $"Edit Product: '{personEvent.PersonEventReferenceNumber}'";

            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var personEvent = context.Deserialize<PersonEvent>(stepData[0].ToString());

            if (context.LinkedItemId <= 0)
            {
                await _eventService.AddPersonEvent(personEvent);
            }
            else
            {
                await _eventService.AddPersonEvent(personEvent);// no edit in Person Event 
            }
        }

        public Task CancelWizard(IWizardContext context)
        {
            //TODO if is new delete the the wizard
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

    }
}
