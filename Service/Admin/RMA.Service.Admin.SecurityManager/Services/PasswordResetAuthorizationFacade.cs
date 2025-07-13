using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class PasswordResetAuthorizationFacade : RemotingStatelessService, IPasswordResetAuthorizationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_PasswordResetAuthorisation> _repository;
        private readonly IMapper _mapper;

        public PasswordResetAuthorizationFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<security_PasswordResetAuthorisation> repository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<PasswordResetAuthorization> GetPasswordResetAuthorization(string token)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var compareTime = DateTimeHelper.SaNow.Subtract(new TimeSpan(0, 60, 0));

                var dbValues = await _repository
                    .Where(lookup =>
                        lookup.Token == token && !lookup.HasExpired && lookup.CreationDate > compareTime)
                    .ProjectTo<PasswordResetAuthorization>(_mapper.ConfigurationProvider)
                    .SingleAsync("Error in authentication token");

                var data = new PasswordResetAuthorization
                {
                    Token = dbValues.Token,
                    Email = dbValues.Email,
                    HasExpired = dbValues.HasExpired,
                    CreationDate = dbValues.CreationDate
                };

                return data;
            }
        }

        public async Task<AuthenticationResult> SavePasswordResetAuthorization(
            PasswordResetAuthorization passwordResetAuthorisation)
        {
            Contract.Requires(passwordResetAuthorisation != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (string.IsNullOrWhiteSpace(passwordResetAuthorisation.Email)
                    || string.IsNullOrWhiteSpace(passwordResetAuthorisation.Token)
                    || passwordResetAuthorisation.CreationDate > DateTimeHelper.SaNow
                    && passwordResetAuthorisation.CreationDate <= DateTimeHelper.SaNow.AddMinutes(-60)
                )
                {
                    return new AuthenticationResult { IsSuccess = false };
                }

                var data = new PasswordResetAuthorization
                {
                    CreationDate = passwordResetAuthorisation.CreationDate,
                    Email = passwordResetAuthorisation.Email,
                    HasExpired = passwordResetAuthorisation.HasExpired,
                    Token = passwordResetAuthorisation.Token
                };
                var entity = _mapper.Map<security_PasswordResetAuthorisation>(data);

                _repository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return new AuthenticationResult { IsSuccess = true, Token = passwordResetAuthorisation.Token };
            }
        }
    }
}