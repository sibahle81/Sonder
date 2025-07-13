using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class InvoiceLineItemFacade : RemotingStatelessService, IInvoiceLineItemService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private readonly IRepository<billing_InvoiceLineItem> _invoiceLineItemRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;

        public InvoiceLineItemFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<billing_InvoiceLineItem> invoiceLineItemRepository,
            IConfigurationService configurationService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceLineItemRepository = invoiceLineItemRepository;
            _configurationService = configurationService;
        }

        public async Task<List<InvoiceLineItem>> GetInvoiceLineItems()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await _invoiceLineItemRepository
                    .Where(inv => inv.InvoiceLineItemsId > 0)
                    .ToListAsync();
                return Mapper.Map<List<InvoiceLineItem>>(invoices);
            }
        }

        public async Task<InvoiceLineItem> GetInvoiceLineItem(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.Create())
            {
                var invoice = await _invoiceLineItemRepository
                    .SingleAsync(inv => inv.InvoiceLineItemsId == id,
                        $"Could not find invoice line item with id {id}");

                return Mapper.Map<InvoiceLineItem>(invoice);
            }
        }

        public async Task<int> AddInvoiceLineItem(InvoiceLineItem invoiceLineItem)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_InvoiceLineItem>(invoiceLineItem);
                _invoiceLineItemRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.InvoiceId;
            }
        }

        public async Task EditInvoiceLineItem(InvoiceLineItem invoiceLineItem)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataCrossRef = await _invoiceLineItemRepository.Where(x => x.InvoiceId == invoiceLineItem.InvoiceId).SingleAsync();

                _invoiceLineItemRepository.Update(dataCrossRef);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }
    }
}
