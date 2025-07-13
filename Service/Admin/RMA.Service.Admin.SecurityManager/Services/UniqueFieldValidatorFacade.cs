using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;

using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class UniqueFieldValidatorFacade : RemotingStatelessService, IUniqueFieldValidatorService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_Role> _roleRepository;
        private readonly IRepository<security_User> _userRepository;

        public UniqueFieldValidatorFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<security_Role> roleRepository,
            IRepository<security_User> userRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
        }

        public async Task<bool> Exists(UniqueValidationRequest request)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                switch (request.Table.ToLower())
                {
                    case "role":
                        return await CheckRoleOption(request);
                    case "user":
                    default:
                        return await CheckClietnOption(request);
                }
            }
        }

        private async Task<bool> CheckClietnOption(UniqueValidationRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                switch (request.Field.ToLower())
                {
                    default:
                        return await _userRepository.AnyAsync(user => user.Email == request.Value);
                }
            }
        }

        private async Task<bool> CheckRoleOption(UniqueValidationRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                switch (request.Field.ToLower())
                {
                    default:
                        return await _roleRepository.AnyAsync(role => role.Name == request.Value);
                }
            }
        }
    }
}