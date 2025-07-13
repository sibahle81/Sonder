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
    public class SkillCategoryFacade : RemotingStatelessService, ISkillCategoryService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_SkillCategory> _skillCategoryRepository;
        private readonly IMapper _mapper;

        public SkillCategoryFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_SkillCategory> skillCategoryRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _skillCategoryRepository = skillCategoryRepository;
            _mapper = mapper;
        }

        public async Task<List<SkillCategory>> GetSkillCategories()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var skillCategories = await _skillCategoryRepository
                    .OrderBy(sc => sc.Name)
                    .ProjectTo<SkillCategory>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return skillCategories;
            }
        }

        public async Task<SkillCategory> GetSkillCategoryByName(string name)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var skillCategory = await _skillCategoryRepository
                    .ProjectTo<SkillCategory>(_mapper.ConfigurationProvider)
                    .SingleAsync(sc => sc.Name == name,
                        $"Could not find skill category with name '{name}'");

                return _mapper.Map<SkillCategory>(skillCategory);
            }
        }
    }
}