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
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class PreAuthBreakdownUnderAssessReasonFacade : RemotingStatelessService, IPreAuthBreakdownUnderAssessReasonService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_PreAuthBreakdownUnderAssessReason> _preAuthBreakdownUnderAssessReasonRepository;

        public PreAuthBreakdownUnderAssessReasonFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_PreAuthBreakdownUnderAssessReason> medicalPreAuthBreakdownUnderAssessReason)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _preAuthBreakdownUnderAssessReasonRepository = medicalPreAuthBreakdownUnderAssessReason;
        }

        public async Task<int> AddPreAuthBreakdownUnderAssessReason(PreAuthBreakdownUnderAssessReason preAuthBreakdownUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_PreAuthBreakdownUnderAssessReason>(preAuthBreakdownUnderAssessReason);
                _preAuthBreakdownUnderAssessReasonRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task<List<PreAuthBreakdownUnderAssessReason>> GetPreAuthBreakdownUnderAssessReasonByPreAuthBreakdownId(int preAuthBreakdownId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _preAuthBreakdownUnderAssessReasonRepository.Where(i => i.PreAuthBreakdownId == preAuthBreakdownId).ProjectTo<PreAuthBreakdownUnderAssessReason>().ToListAsync();
            }
        }

        public async Task<int> DeletePreAuthBreakdownUnderAssessReason(PreAuthBreakdownUnderAssessReason preAuthBreakdownUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _preAuthBreakdownUnderAssessReasonRepository.FirstOrDefaultAsync(a => a.PreAuthBreakdownId == preAuthBreakdownUnderAssessReason.PreAuthBreakdownId);

                entity.IsActive = false;
                entity.IsDeleted = true;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _preAuthBreakdownUnderAssessReasonRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }
    }
}
