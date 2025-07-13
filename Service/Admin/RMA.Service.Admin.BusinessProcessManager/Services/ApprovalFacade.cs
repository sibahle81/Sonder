using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Services
{
    public class ApprovalFacade : RemotingStatelessService, IApprovalService
    {
        private readonly IRepository<bpm_Approval> _approvalRepository;

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public ApprovalFacade(StatelessServiceContext context,
            IRepository<bpm_Approval> approvalRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            IMapper mapper
        )
            : base(context)
        {
            _approvalRepository = approvalRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _mapper = mapper;
        }

        public async Task<int> AddApproval(Approval approvalViewModel)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<bpm_Approval>(approvalViewModel);
                _approvalRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task AddApprovals(List<Approval> approvalViewModels)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entities = _mapper.Map<bpm_Approval>(approvalViewModels);
                _approvalRepository.Create(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task EditApproval(Approval approvalViewModel)
        {
            Contract.Requires(approvalViewModel != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                await _approvalRepository.SingleAsync(s => s.Id == approvalViewModel.Id,
                    $"Could not find an approval with the id {approvalViewModel.Id}");

                var entity = _mapper.Map<bpm_Approval>(approvalViewModel);
                _approvalRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<Approval> GetApprovalById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _approvalRepository
                    .ProjectTo<Approval>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id,
                        $"Could not find an approval with the id {id}");
                return entity;
            }
        }

        public async Task<List<Approval>> GetApprovals()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _approvalRepository
                    .ProjectTo<Approval>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return entities;
            }
        }

        public async Task<List<Approval>> GetApprovalsByTypeAndId(string itemType, int itemId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _approvalRepository
                    .Where(s => s.ItemType == itemType && s.ItemId == itemId)
                    .ProjectTo<Approval>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return entities;
            }
        }
    }
}