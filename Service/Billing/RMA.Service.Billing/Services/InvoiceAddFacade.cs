using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;

using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading.Tasks;

using Invoice = RMA.Service.Billing.Contracts.Entities.Invoice;

namespace RMA.Service.Billing.Services
{
    public class InvoiceAddFacade : RemotingStatelessService, IInvoiceAddService
    {
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        public InvoiceAddFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<billing_Invoice> invoiceRepository

        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<int> AddInvoiceItem(Invoice invoice)
        {
            Contract.Requires(invoice != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_Invoice>(invoice);
                _invoiceRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.InvoiceId;
            }
        }
    }
}
