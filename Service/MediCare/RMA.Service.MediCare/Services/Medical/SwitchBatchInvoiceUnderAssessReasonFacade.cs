using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class SwitchBatchInvoiceUnderAssessReasonFacade : RemotingStatelessService, ISwitchBatchInvoiceUnderAssessReasonService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_SwitchBatchInvoiceUnderAssessReason> _switchBatchInvoiceUnderAssessReasonRepository;
        private readonly IRepository<medical_SwitchBatchInvoiceLineUnderAssessReason> _switchBatchInvoiceLineUnderAssessReasonRepository;

        public SwitchBatchInvoiceUnderAssessReasonFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_SwitchBatchInvoiceUnderAssessReason> switchBatchInvoiceUnderAssessReasonRepository
            , IRepository<medical_SwitchBatchInvoiceLineUnderAssessReason> switchBatchInvoiceLineUnderAssessReasonRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _switchBatchInvoiceUnderAssessReasonRepository = switchBatchInvoiceUnderAssessReasonRepository;
            _switchBatchInvoiceLineUnderAssessReasonRepository = switchBatchInvoiceLineUnderAssessReasonRepository;
        }

        public async Task<int> AddSwitchBatchInvoiceUnderAssessReason(SwitchBatchInvoiceUnderAssessReason switchBatchInvoiceUnderAssessReason)
        {
            Contract.Requires(switchBatchInvoiceUnderAssessReason!=null);
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                switchBatchInvoiceUnderAssessReason.IsActive = true;
                var entity = Mapper.Map<medical_SwitchBatchInvoiceUnderAssessReason>(switchBatchInvoiceUnderAssessReason);
                _switchBatchInvoiceUnderAssessReasonRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task<List<SwitchBatchInvoiceUnderAssessReason>> GetSwitchBatchInvoiceUnderAssessReasonsBySwitchBatchInvoiceId(int switchBatchInvoiceId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _switchBatchInvoiceUnderAssessReasonRepository.Where(i => i.SwitchBatchInvoiceId == switchBatchInvoiceId).ProjectTo<SwitchBatchInvoiceUnderAssessReason>().ToListAsync();
            }
        }

        public async Task<int> AddSwitchBatchInvoiceLineUnderAssessReason(SwitchBatchInvoiceLineUnderAssessReason switchBatchInvoiceLineUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_SwitchBatchInvoiceLineUnderAssessReason>(switchBatchInvoiceLineUnderAssessReason);
                _switchBatchInvoiceLineUnderAssessReasonRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task<int> DeleteSwitchBatchInvoiceUnderAssessReason(SwitchBatchInvoiceUnderAssessReason invoiceUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.DeleteSwitchBatchMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _switchBatchInvoiceUnderAssessReasonRepository.FirstOrDefaultAsync(a => a.Id == invoiceUnderAssessReason.Id);

                entity.IsActive = false;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _switchBatchInvoiceUnderAssessReasonRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task<int> EnableSwitchBatchInvoiceUnderAssessReason(SwitchBatchInvoiceUnderAssessReason invoiceUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.EditMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _switchBatchInvoiceUnderAssessReasonRepository.FirstOrDefaultAsync(a => a.Id == invoiceUnderAssessReason.Id);

                entity.IsActive = true;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _switchBatchInvoiceUnderAssessReasonRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }


    }
}
