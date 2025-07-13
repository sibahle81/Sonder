using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Data.Entity;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class InvoiceCompCareMapFacade : RemotingStatelessService, IInvoiceCompCareMapService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_InvoiceCompCareMap> _invoiceCompCareMapRepository;
        public InvoiceCompCareMapFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_InvoiceCompCareMap> invoiceCompCareMapRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceCompCareMapRepository = invoiceCompCareMapRepository;
        }
        public async Task<InvoiceCompCareMap> GetInvoiceCompCareMapByInvoiceId(int invoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _invoiceCompCareMapRepository.FirstOrDefaultAsync(x => x.InvoiceId == invoiceId);
                return Mapper.Map<InvoiceCompCareMap>(entity);
            }
        }

        public async Task<InvoiceCompCareMap> GetInvoiceCompCareMapByCompCareInvoiceId(int invoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _invoiceCompCareMapRepository.FirstOrDefaultAsync(x => x.CompCareInvoiceId == invoiceId);
                return Mapper.Map<InvoiceCompCareMap>(entity);
            }
        }
        public async Task<int> AddInvoiceCompCareMap(InvoiceCompCareMap invoiceCompCareMap)
        {
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);
            var invoiceCompCareMapId = 0;
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_InvoiceCompCareMap>(invoiceCompCareMap);
                _invoiceCompCareMapRepository.Create(entity);
                await scope.SaveChangesAsync();

                invoiceCompCareMapId = entity.InvoiceCompCareMapId;
            }
            return invoiceCompCareMapId;
        }
    }
}
