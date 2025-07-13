using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class ClaimBranchFacade : RemotingStatelessService, IClaimBranchService
    {
        private readonly IRepository<common_Branch> _claimBranchRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public ClaimBranchFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_Branch> claimBranchRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _claimBranchRepository = claimBranchRepository;
            _mapper = mapper;
        }

        public async Task<List<RMABranch>> GetClaimBranches()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var branches = await _claimBranchRepository
                    .Where(branch => branch.IsActive && !branch.IsDeleted)
                    .OrderBy(branch => branch.Name)
                    .ProjectTo<RMABranch>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return branches;
            }
        }
    }
}