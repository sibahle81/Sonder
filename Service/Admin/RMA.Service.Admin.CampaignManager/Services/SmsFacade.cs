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
    public class SmsFacade : RemotingStatelessService, ISmsService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_Sm> _smsRepository;
        private readonly IRepository<campaign_SmsTemplate> _smsTemplatesRepository;
        private readonly IRepository<campaign_SmsToken> _smsTokensRepository;
        private readonly IRepository<campaign_SmsAudit> _smsAuditRepository;
        private readonly IMapper _mapper;

        public SmsFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_Sm> smsRepository,
            IRepository<campaign_SmsTemplate> smsTemplatesRepository,
            IRepository<campaign_SmsToken> smsTokensRepository,
            IRepository<campaign_SmsAudit> smsAuditRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _smsRepository = smsRepository;
            _smsTemplatesRepository = smsTemplatesRepository;
            _smsTokensRepository = smsTokensRepository;
            _smsAuditRepository = smsAuditRepository;
            _mapper = mapper;
        }

        public async Task<MessageContent> GetSmsContent(Sms sms)
        {
            Contract.Requires(sms != null);
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var template = await FindSmsTemplate(sms.TemplateId);
                var content = template.Template;
                // First replace the tokens passed as parameters...
                foreach (var token in sms.Tokens) content = content.Replace($"[{token.Key}]", token.Value);
                // ... then replace the tokens read from the database.
                var dataSms = await FindSms(sms.Id);
                foreach (var token in dataSms.SmsTokens)
                {
                    content = content.Replace($"[{token.TokenKey}]", token.TokenValue);
                }
                return new MessageContent
                {
                    Key = "message",
                    Content = content
                };
            }
        }

        public async Task<MessageContent> GetSmsContentById(int smsId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var sms = await FindSms(smsId);
                var template = await FindSmsTemplate(sms.TemplateId);
                var content = template.Template;
                foreach (var token in sms.SmsTokens)
                {
                    content = content.Replace($"[{token.TokenKey}]", token.TokenValue);
                }
                return new MessageContent
                {
                    Key = "message",
                    Content = content
                };
            }
        }

        public async Task<Sms> GetSms(int id)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var sms = await _smsRepository
                    .Where(e => e.Id == id)
                    .ProjectTo<Sms>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Campaign sms with id {id} could not be found.");
                return sms;
            }
        }

        public async Task<Sms> GetCampaignSms(int campaignId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var sms = await _smsRepository
                    .ProjectTo<Sms>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync(e => e.CampaignId == campaignId
                                               && e.IsActive);
                return sms;
            }
        }

        public async Task<int> AddSms(Sms sms)
        {
            RmaIdentity.DemandPermission(Permissions.AddCampaign);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = _mapper.Map<campaign_Sm>(sms);
                _smsRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task EditSms(Sms sms)
        {
            RmaIdentity.DemandPermission(Permissions.EditCampaign);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = _mapper.Map<campaign_Sm>(sms);
                _smsRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task CopySmses(int campaignId, int newCampaignId)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var smses = await _smsRepository
                    .Where(e => e.CampaignId == campaignId)
                    .ProjectTo<Sms>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                var smsList = new List<Sms>();

                foreach (var sms in smses)
                {
                    sms.CampaignId = newCampaignId;

                    smsList.Add(sms);
                }

                var dataSms = _mapper.Map<List<campaign_Sm>>(smsList);
                var entityIds = _smsRepository.Create(dataSms);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                foreach (var (s, newSmsId) in from s in smsList
                                              from a in entityIds
                                              let newSmsId = a.Id
                                              select (s, newSmsId))
                {
                    await CopySmsTokens(s.Id, newSmsId);
                }
            }
        }

        public async Task ModifyCampaignSmses(List<Sms> campaignSmses)
        {
            if (campaignSmses == null) return;
            if (campaignSmses.Count == 0) return;
            foreach (var sms in campaignSmses)
            {
                if (sms.Id == 0)
                    await AddSms(sms);
                else
                    await EditSms(sms);
            }
        }

        public async Task<bool> CheckIfSmsSent(int itemId, string itemType, string message, string cellNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var audit = await _smsAuditRepository
                    .SingleOrDefaultAsync(t => t.ItemId == itemId && t.ItemType == itemType &&
                    t.Message == message && t.SmsNumbers == cellNumber);

                return audit != null;
            }
        }

        #region Private Methods
        private async Task<campaign_Sm> FindSms(int id)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var sms = await _smsRepository
                    .Where(e => e.Id == id)
                    .SingleAsync($"Campaign sms with id {id} could not be found.");
                return sms;
            }
        }

        private async Task<SmsTemplate> FindSmsTemplate(int id)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var template = await _smsTemplatesRepository
                    .Where(t => t.Id == id)
                    .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Sms template with id {id} could not be found.");
                return template;
            }
        }

        private async Task CopySmsTokens(int smsId, int newSmsId)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var smsTokens = await _smsTokensRepository
                    .Where(st => st.SmsId == smsId)
                    .ToListAsync();

                foreach (var token in smsTokens)
                {
                    var entity = new campaign_SmsToken
                    {
                        SmsId = newSmsId,
                        IsActive = token.IsActive,
                        TokenKey = token.TokenKey,
                        TokenValue = token.TokenValue,
                    };

                    _smsTokensRepository.Create(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }
        #endregion
    }
}