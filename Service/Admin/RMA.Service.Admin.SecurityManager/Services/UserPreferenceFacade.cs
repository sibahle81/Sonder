using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class UserPreferenceFacade : RemotingStatelessService, IUserPreferenceService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_UserPreference> _preferenceRepository;
        private readonly IMapper _mapper;

        public UserPreferenceFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<security_UserPreference> preferenceRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _preferenceRepository = preferenceRepository;
            _mapper = mapper;
        }

        public async Task<UserPreference> GetUserPreference(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userPreference = await _preferenceRepository
                    .ProjectTo<UserPreference>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id, $"The user preference with id {id} could not be found");

                return userPreference;
            }
        }

        public async Task<UserPreference> GetUserPreferenceForUser(int userId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userPreferences = await _preferenceRepository
                    .ProjectTo<UserPreference>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync(s => s.UserId == userId && s.IsActive);
                if (userPreferences == null)
                {
                    userPreferences = new UserPreference
                    {
                        Id = 0,
                        UserId = userId,
                        Preferences = "{}"
                    };
                }
                return userPreferences;
            }
        }

        public async Task ResetUserPreference(int id)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var userPreference = await _preferenceRepository
                    .ProjectTo<UserPreference>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id, $"The user preference with id {id} could not be found");

                userPreference.Preferences = "{}";

                var entity = _mapper.Map<security_UserPreference>(userPreference);
                _preferenceRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> SaveUserPreference(UserPreference userPreference)
        {
            Contract.Requires(userPreference != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                int id = 0;
                var preference = await _preferenceRepository
                    .SingleOrDefaultAsync(s => s.UserId == userPreference.UserId);
                if (preference == null)
                {
                    var entity = _mapper.Map<security_UserPreference>(userPreference);
                    entity.IsActive = true;
                    entity.IsDeleted = false;
                    _preferenceRepository.Create(entity);
                    id = entity.Id;
                }
                else
                {
                    preference.IsActive = true;
                    preference.IsDeleted = false;
                    preference.Preferences = userPreference.Preferences;
                    id = preference.Id;
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return id;
            }
        }
    }
}