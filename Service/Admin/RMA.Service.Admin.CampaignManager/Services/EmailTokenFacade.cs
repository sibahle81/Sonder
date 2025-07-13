using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class EmailTokenFacade : RemotingStatelessService, IEmailTokenService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_EmailToken> _emailTokenRepository;
        private readonly IMapper _mapper;

        public EmailTokenFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_EmailToken> emailTokenRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _emailTokenRepository = emailTokenRepository;
            _mapper = mapper;
        }

        public async Task<List<EmailToken>> GetTokens(int emailId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var tokens = await _emailTokenRepository
                    .Where(token => token.EmailId == emailId)
                    .Where(token => token.IsActive && !token.IsDeleted)
                    .ProjectTo<EmailToken>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return tokens;
            }
        }

        public async Task<int> SaveTokens(List<EmailToken> tokens)
        {
            Contract.Requires(tokens != null);
            RmaIdentity.DemandPermission(Permissions.EditCampaignTemplate);
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var token in tokens)
                {
                    token.IsActive = true;
                    token.IsDeleted = false;
                    var dataToken = await FindToken(token.EmailId, token.TokenKey);
                    if (dataToken == null)
                    {
                        token.Id = 0;
                        var entity = _mapper.Map<campaign_EmailToken>(token);
                        _emailTokenRepository.Create(entity);
                    }
                    else
                    {
                        token.Id = dataToken.Id;
                        var entity = _mapper.Map<campaign_EmailToken>(token);
                        _emailTokenRepository.Update(entity);
                    }
                }
                var count = await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        public async Task<int> DeleteTokens(int emailId)
        {
            RmaIdentity.DemandPermission(Permissions.EditCampaignTemplate);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var tokens = await _emailTokenRepository
                    .Where(token => token.EmailId == emailId)
                    .ToListAsync();
                var count = 0;
                foreach (var token in tokens)
                {
                    _emailTokenRepository.Delete(token);
                    count++;
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        private async Task<EmailToken> FindToken(int emailId, string tokenKey)
        {
            var dataToken = await _emailTokenRepository
                .Where(token => token.EmailId == emailId && token.TokenKey == tokenKey)
                .ProjectTo<EmailToken>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync();
            return dataToken;
        }
    }
}