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
    public class InsuredLifeUploadErrorAuditFacade : RemotingStatelessService, IInsuredLifeUploadErrorAuditService
    {
        private readonly IRepository<policy_InsuredLifeErrorAudit> _insuredLifeErrorRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        public InsuredLifeUploadErrorAuditFacade(StatelessServiceContext context,
          IDbContextScopeFactory dbContextScopeFactory,
          IRepository<policy_InsuredLifeErrorAudit> insuredLifeErrorRepository)
          : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _insuredLifeErrorRepository = insuredLifeErrorRepository;
        }

        public async Task<int> AddInsuredLifeErrorAudit(InsuredLifeErrorAudit insuredLifeErrorAudit)
        {
            Contract.Requires(insuredLifeErrorAudit != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_InsuredLifeErrorAudit>(insuredLifeErrorAudit);
                _insuredLifeErrorRepository.Create(entity);
                return await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task EditInsuredLifeErrorAudit(InsuredLifeErrorAudit insuredLifeErrorAudit)
        {
            Contract.Requires(insuredLifeErrorAudit != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataCrossRef = await _insuredLifeErrorRepository.Where(x => x.Id == insuredLifeErrorAudit.Id).SingleAsync();

                _insuredLifeErrorRepository.Update(dataCrossRef);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task<InsuredLifeErrorAudit> GetInsuredLifeErrorAuditById(int id)
        {
            using (_dbContextScopeFactory.Create())
            {
                var insuredLifeErrorAudit = await _insuredLifeErrorRepository
                    .SingleAsync(pol => pol.Id == id,
                        $"Could not find insured life file with id {id}");

                return Mapper.Map<InsuredLifeErrorAudit>(insuredLifeErrorAudit);
            }
        }

        public async Task<List<InsuredLifeErrorAudit>> GetInsuredLivesErrorAudits(string fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var insuredLifeErrorAudits = await _insuredLifeErrorRepository
                    .Where(x => x.FileIdentifier == fileIdentifier)
                    .ProjectTo<InsuredLifeErrorAudit>().ToListAsync();
                return Mapper.Map<List<InsuredLifeErrorAudit>>(insuredLifeErrorAudits);
            }
        }
    }
}
