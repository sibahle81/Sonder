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
    public class SmsTokenFacade : RemotingStatelessService, ISmsTokenService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_SmsToken> _smsTokensRepository;
        private readonly IMapper _mapper;

        public SmsTokenFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_SmsToken> smsTokensRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _smsTokensRepository = smsTokensRepository;
            _mapper = mapper;
        }

        public async Task<List<SmsToken>> GetTokens(int smsId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var tokens = await _smsTokensRepository
                    .Where(token => token.SmsId == smsId)
                    .Where(token => token.IsActive && !token.IsDeleted)
                    .ProjectTo<SmsToken>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return tokens;
            }
        }

        public async Task<int> SaveTokens(List<SmsToken> tokens)
        {
            Contract.Requires(tokens != null);
            RmaIdentity.DemandPermission(Permissions.EditCampaignTemplate);
            using (var scope = _dbContextScopeFactory.Create())
            {
                foreach (var token in tokens)
                {
                    token.IsActive = true;
                    token.IsDeleted = false;
                    var dataToken = await FindToken(token.SmsId, token.TokenKey);
                    if (dataToken == null)
                    {
                        token.Id = 0;
                        var entity = _mapper.Map<campaign_SmsToken>(token);
                        _smsTokensRepository.Create(entity);
                    }
                    else
                    {
                        token.Id = dataToken.Id;
                        var entity = _mapper.Map<campaign_SmsToken>(token);
                        _smsTokensRepository.Update(entity);
                    }
                }
                var count = await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        public async Task<int> DeleteTokens(int smsId)
        {
            RmaIdentity.DemandPermission(Permissions.EditCampaignTemplate);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var tokens = await _smsTokensRepository
                    .Where(token => token.SmsId == smsId)
                    .ToListAsync();
                var count = tokens.Count;

                _smsTokensRepository.Delete(tokens);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        private async Task<SmsToken> FindToken(int smsId, string tokenKey)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var dataToken = await _smsTokensRepository
                    .Where(token => token.SmsId == smsId && token.TokenKey == tokenKey)
                    .ProjectTo<SmsToken>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync();
                return dataToken;
            }
        }
    }
}