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
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.ProductWizard
{
    public class ProductWizard : IWizardProcess
    {
        private readonly IProductService _productService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IWizardService _wizardService;

        public ProductWizard(
            IProductService productService,
            IDocumentGeneratorService documentGeneratorService,
            IWizardService wizardService)
        {
            _productService = productService;
            _documentGeneratorService = documentGeneratorService;
            _wizardService = wizardService;

        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
        {
            return string.Empty;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            Product product;

            if (context.LinkedItemId <= 0)
            {
                RmaIdentity.DemandPermission(Permissions.AddProduct);
                product = new Product();
                var code = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Product, "");
                product.StartDate = DateTimeHelper.SaNow.Date;
                product.EndDate = null;
                product.Code = code;
            }
            else
            {
                RmaIdentity.DemandPermission(Permissions.EditProduct);
                product = await _productService.GetProduct(context.LinkedItemId);
            }

            var wizardId = await AddWizard(context, product);

            return await Task.FromResult(wizardId);
        }

        private async Task<int> AddWizard(IWizardContext context, Product product)
        {
            var stepData = new ArrayList()
            {
                product
            };

            var label = product.Id <= 0
                ? $"New Product: '{product.Code}'"
                : $"Edit Product: '{product.Code}'";

            return await context.CreateWizard(label, stepData);
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var product = context.Deserialize<Product>(stepData[0].ToString());

            if (context.LinkedItemId <= 0)
            {
                await _productService.AddProduct(product, wizard.Id);
            }
            else
            {
                await _productService.EditProduct(product, wizard.Id);
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
            var wizard = context?.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var product = context.Deserialize<Product>(stepData[0].ToString());

            await _wizardService.EditWizardName(wizard.Id, $"New Product: {product.Code}");
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
