using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class SwitchBatchInvoiceLineUnderAssessReasonFacade : RemotingStatelessService, ISwitchBatchInvoiceLineUnderAssessReasonService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_SwitchBatchInvoiceLineUnderAssessReason> _switchBatchInvoiceLineUnderAssessReasonRepository;

        public SwitchBatchInvoiceLineUnderAssessReasonFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_SwitchBatchInvoiceLineUnderAssessReason> switchBatchInvoiceLineUnderAssessReasonRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _switchBatchInvoiceLineUnderAssessReasonRepository = switchBatchInvoiceLineUnderAssessReasonRepository;
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
    }
}
