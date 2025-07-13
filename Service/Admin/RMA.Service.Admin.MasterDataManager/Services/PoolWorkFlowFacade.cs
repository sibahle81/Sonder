using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class PoolWorkFlowFacade : RemotingStatelessService, IPoolWorkFlowService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_PoolWorkFlow> _workPoolFlowRepository;
        private readonly IMapper _mapper;

        public PoolWorkFlowFacade(
        IDbContextScopeFactory dbContextScopeFactory,
        IRepository<common_PoolWorkFlow> workPoolFlowRepository,
        StatelessServiceContext context,
        IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _workPoolFlowRepository = workPoolFlowRepository;
            _mapper = mapper;
        }

        public async Task HandlePoolWorkFlow(PoolWorkFlow poolWorkFlow)
        {
            Contract.Requires(poolWorkFlow != null);

            if (poolWorkFlow.AssignedToUserId == null || poolWorkFlow.AssignedToUserId <= 0)
            {
                poolWorkFlow.AssignedToUserId = null;
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingPoolWorkFlow = await _workPoolFlowRepository.FirstOrDefaultAsync(s => s.PoolWorkFlowItemType == poolWorkFlow.PoolWorkFlowItemType && s.ItemId == poolWorkFlow.ItemId);
                if (existingPoolWorkFlow != null)
                {
                    var assignedToUserId = poolWorkFlow.AssignedToUserId;

                    if (existingPoolWorkFlow.WorkPool == poolWorkFlow.WorkPool)
                    {
                        if (existingPoolWorkFlow.AssignedToUserId != null && poolWorkFlow.AssignedToUserId != existingPoolWorkFlow.AssignedToUserId)
                        {
                            assignedToUserId = Convert.ToInt32(poolWorkFlow.AssignedToUserId);
                        }

                        if (existingPoolWorkFlow.AssignedToUserId != null && poolWorkFlow.AssignedToUserId == existingPoolWorkFlow.AssignedToUserId)
                        {
                            assignedToUserId = Convert.ToInt32(existingPoolWorkFlow.AssignedToUserId);
                        }
                    }

                    existingPoolWorkFlow.EffectiveTo = poolWorkFlow.EffectiveTo;
                    existingPoolWorkFlow.PoolWorkFlowItemType = poolWorkFlow.PoolWorkFlowItemType;
                    existingPoolWorkFlow.AssignedByUserId = poolWorkFlow.AssignedByUserId;
                    existingPoolWorkFlow.AssignedToUserId = assignedToUserId;
                    existingPoolWorkFlow.WorkPool = poolWorkFlow.WorkPool;
                    existingPoolWorkFlow.Instruction = poolWorkFlow.Instruction;

                    _workPoolFlowRepository.Update(existingPoolWorkFlow);
                }
                else
                {
                    var entity = _mapper.Map<common_PoolWorkFlow>(poolWorkFlow);
                    _workPoolFlowRepository.Create(entity);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PoolWorkFlow> GetPoolWorkFlow(int itemId, WorkPoolEnum workPoolId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingPoolWorkFlow = await _workPoolFlowRepository
                    .FirstOrDefaultAsync(s => s.ItemId == itemId && s.WorkPool == workPoolId
                                                                  && !s.IsDeleted);
                return _mapper.Map<PoolWorkFlow>(existingPoolWorkFlow);
            }
        }

        public async Task<List<int>> GetPoolWorkFlowClaimsAssignedToUser(int assignedToUserId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var workPools = new WorkPoolEnum[] {
                    WorkPoolEnum.CadPool,
                    WorkPoolEnum.CcaPool,
                    WorkPoolEnum.ScaPool,
                    WorkPoolEnum.CmcPool,
                    WorkPoolEnum.ClaimsAssessorPool,
                    WorkPoolEnum.EarningsAssessorpool
                };

                var claimsPoolWork = await _workPoolFlowRepository
                    .Where(p => p.AssignedToUserId == assignedToUserId
                    && workPools.Contains(p.WorkPool)
                    && !p.IsDeleted)
                    .ToListAsync();
                return claimsPoolWork.Select(p => p.ItemId).Distinct().ToList();
            }
        }

        public async Task<PoolWorkFlow> GetPoolWorkFlowByTypeAndId(PoolWorkFlowRequest poolWorkFlowRequest)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _workPoolFlowRepository.FirstOrDefaultAsync(s => s.PoolWorkFlowItemType == poolWorkFlowRequest.ItemType && s.ItemId == poolWorkFlowRequest.ItemId);
                return _mapper.Map<PoolWorkFlow>(result);
            }
        }
    }
}