using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ProductOptionWizard
{
    public class ProductOptionWizard : IWizardProcess
    {
        private readonly IProductOptionService _productOptionService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IWizardService _wizardService;

        public ProductOptionWizard(IProductOptionService productOptionService,
            IDocumentGeneratorService documentGeneratorService,
            IWizardService wizardService)
        {
            _productOptionService = productOptionService;
            _documentGeneratorService = documentGeneratorService;
            _wizardService = wizardService;
        }

        public Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return Task.FromResult(string.Empty);
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            ProductOption productOption;

            if (context.LinkedItemId <= 0)
            {
                RmaIdentity.DemandPermission(Permissions.AddProductOption);
                productOption = new ProductOption();
                var code = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.ProductOption, "");
                productOption.Code = code;
                productOption.StartDate = DateTimeHelper.SaNow.Date;
                productOption.EndDate = null;
            }
            else
            {
                RmaIdentity.DemandPermission(Permissions.EditProductOption);
                productOption = await _productOptionService.GetProductOption(context.LinkedItemId);
            }

            var wizardId = await AddWizard(context, productOption);

            return await Task.FromResult(wizardId);
        }

        private async Task<int> AddWizard(IWizardContext context, ProductOption productOption)
        {
            var stepData = new ArrayList()
            {
                productOption
            };

            var label = productOption.Id == 0
                ? $"New Option: '{productOption.Code}'"
                : $"Edit Option: '{productOption.Code}'";

            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var productOption = context.Deserialize<ProductOption>(stepData[0].ToString());

            if (context.LinkedItemId <= 0)
            {
                await _productOptionService.AddProductOption(productOption);
            }
            else
            {
                await _productOptionService.EditProductOption(productOption);
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

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public async Task OverrideWizard(IWizardContext context)
        {
            return;
        }
        public async Task OnSaveStep(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var productOption = context.Deserialize<ProductOption>(stepData[0].ToString());

            var label = productOption.Id == 0
                ? $"New Option: '{productOption.Code}'"
                : $"Edit Option: '{productOption.Code}'";
            await _wizardService.EditWizardName(wizard.Id, label);
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
