using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using Switch = RMA.Service.MediCare.Contracts.Entities.Medical.Switch;

namespace RMA.Service.MediCare.Services.Medical
{
    public class SwitchBatchFacade : RemotingStatelessService, ISwitchBatchService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_SwitchBatch> _switchBatchRepository;
        private readonly IRepository<medical_Switch> _switchRepository;
        private readonly IRepository<medical_SwitchBatchInvoice> _switchBatchInvoiceRepository;

        public SwitchBatchFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_SwitchBatch> switchBatchRepository
            , IRepository<medical_Switch> switchRepository
            , IRepository<medical_SwitchBatchInvoice> switchBatchInvoiceRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _switchBatchRepository = switchBatchRepository;
            _switchRepository = switchRepository;
            _switchBatchInvoiceRepository = switchBatchInvoiceRepository;
        }

        public async Task<int> AddSwitchBatch(SwitchBatch switchBatch)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_SwitchBatch>(switchBatch);
                _switchBatchRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.SwitchBatchId;
            }
        }

        public async Task<List<SwitchBatch>> GetSwitchBatches()
        {
            RmaIdentity.DemandPermission(Permissions.ViewSwitchBatchMedicalInvoice);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var switchBatchRepository = await _switchBatchRepository.ToListAsync();

                var switchBatchList = Mapper.Map<List<SwitchBatch>>(switchBatchRepository);

                return switchBatchList;
            }
        }

        public async Task<SwitchBatch> GetSwitchBatch(int switchBatchId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewSwitchBatchMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _switchBatchRepository.FirstOrDefaultAsync(i => i.SwitchBatchId == switchBatchId);

                var switchBatch = Mapper.Map<SwitchBatch>(entity);

                return switchBatch;
            }
        }

        public async Task<SwitchBatch> GetSwitchBatchDetail(string switchBatchNumber, int switchId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewSwitchBatchMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _switchBatchRepository.FirstOrDefaultAsync(i => i.SwitchBatchNumber == switchBatchNumber && i.SwitchId == switchId);
                return Mapper.Map<SwitchBatch>(entity);
            }
        }

        public async Task<Switch> GetSwitch(int switchId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _switchRepository.FirstOrDefaultAsync(i => i.SwitchId == switchId);
                return Mapper.Map<Switch>(entity);
            }
        }

        public async Task<List<Switch>> GetActiveSwitches()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _switchRepository.Where(s => !string.IsNullOrEmpty(s.DownloadDirectory) && s.IsActive).ToListAsync();
                return Mapper.Map<List<Switch>>(entity);
            }
        }

        public async Task<SwitchBatchInvoice> GetSwitchBatchInvoice(int switchBatchInvoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _switchBatchInvoiceRepository.FirstOrDefaultAsync(i => i.SwitchBatchInvoiceId == switchBatchInvoiceId);
                if (entity != null)
                    await _switchBatchInvoiceRepository.LoadAsync(entity, i => i.SwitchBatchInvoiceLines);
                return Mapper.Map<SwitchBatchInvoice>(entity);
            }
        }

    }
}
