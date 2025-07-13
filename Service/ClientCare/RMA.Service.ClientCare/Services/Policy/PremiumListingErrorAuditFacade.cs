using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PremiumListingErrorAuditFacade : RemotingStatelessService, IPremiumListingErrorAuditService
    {
        private readonly IRepository<policy_PremiumListingErrorAudit> _premiumListingErrorRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        public PremiumListingErrorAuditFacade(StatelessServiceContext context,
          IDbContextScopeFactory dbContextScopeFactory,
          IRepository<policy_PremiumListingErrorAudit> premiumListingErrorRepository)
          : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _premiumListingErrorRepository = premiumListingErrorRepository;
        }

        public async Task<List<PremiumListingErrorAudit>> GetPremiumListingErrorAudits(string fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var premiumListingErrorAudits = await _premiumListingErrorRepository
                    .Where(x => x.FileIdentifier == fileIdentifier)
                    .ProjectTo<PremiumListingErrorAudit>().ToListAsync();
                return Mapper.Map<List<PremiumListingErrorAudit>>(premiumListingErrorAudits);
            }
        }

        public async Task<PremiumListingErrorAudit> GetPremiumListingErrorAudit(int id)
        {
            using (_dbContextScopeFactory.Create())
            {
                var premiumListingErrorAudit = await _premiumListingErrorRepository
                    .SingleAsync(pol => pol.Id == id,
                        $"Could not find premium listing file with id {id}");

                return Mapper.Map<PremiumListingErrorAudit>(premiumListingErrorAudit);
            }
        }

        public async Task<int> AddPremiumListingErrorAudit(PremiumListingErrorAudit premiumListingErrorAudit)
        {
            Contract.Requires(premiumListingErrorAudit != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_PremiumListingErrorAudit>(premiumListingErrorAudit);
                _premiumListingErrorRepository.Create(entity);
                return await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task EditPremiumListingErrorAudit(PremiumListingErrorAudit premiumListingErrorAudit)
        {
            Contract.Requires(premiumListingErrorAudit != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataCrossRef = await _premiumListingErrorRepository.Where(x => x.Id == premiumListingErrorAudit.Id).SingleAsync();

                _premiumListingErrorRepository.Update(dataCrossRef);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }
    }
}

