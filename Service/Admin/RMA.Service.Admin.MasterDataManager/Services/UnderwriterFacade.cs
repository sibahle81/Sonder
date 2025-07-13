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
    public class UnderwriterFacade : RemotingStatelessService, IUnderwriterService
    {
        private readonly IRepository<common_Underwriter> _underwriterRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public UnderwriterFacade(
            IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_Underwriter> underwriterRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _underwriterRepository = underwriterRepository;
            _mapper = mapper;
        }

        public async Task<List<Underwriter>> GetUnderwriters()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var underwriters = await _underwriterRepository
                    .ProjectTo<Underwriter>(_mapper.ConfigurationProvider)
                    .OrderBy(u => u.Name)
                    .ToListAsync();
                return underwriters;
            }
        }

        public async Task<Underwriter> GetUnderwriter(int underwriterId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var underwriter = await _underwriterRepository
                    .ProjectTo<Underwriter>(_mapper.ConfigurationProvider)
                    .SingleAsync(u => u.Id == underwriterId, $"Could not find underwriter with id {underwriterId}.");
                return underwriter;
            }
        }

        public async Task<string> GetUnderwriterName(int underwriterId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var underwriter = await _underwriterRepository
                    .ProjectTo<Underwriter>(_mapper.ConfigurationProvider)
                    .SingleAsync(u => u.Id == underwriterId, $"Could not find underwriter with id {underwriterId}.");
                return underwriter.Name;
            }
        }
    }
}
