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
using RMA.Service.Audit.Contracts.Interfaces;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class LastViewedFacade : RemotingStatelessService, ILastViewedService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_Campaign> _campaignRepository;
        private readonly IRepository<campaign_EmailTemplate> _emailTemplateRepository;
        private readonly ILastViewedV1Service _lastViewedService;
        private readonly IRepository<campaign_SmsTemplate> _smsTemplateRepository;
        private readonly IMapper _mapper;

        public LastViewedFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_Campaign> campaignRepository,
            IRepository<campaign_EmailTemplate> emailTemplateRepository,
            IRepository<campaign_SmsTemplate> smsTemplateRepository,
            ILastViewedV1Service lastViewedService,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _campaignRepository = campaignRepository;
            _emailTemplateRepository = emailTemplateRepository;
            _smsTemplateRepository = smsTemplateRepository;
            _lastViewedService = lastViewedService;
            _mapper = mapper;
        }

        public async Task<List<Campaign>> GetLastViewedCampaigns(string user)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.Create())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(user, typeof(campaign_Campaign).Name);
                var ids = lastViewedItems.Select(lastViewedItem => lastViewedItem.ItemId).ToList();
                var campaigns = await GetCampaignsByIds(ids);
                campaigns.ForEach(campaign =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == campaign.Id);
                    if (lastViewedItem != null) campaign.DateViewed = lastViewedItem.Date;
                });
                return campaigns.OrderByDescending(campaign => campaign.DateViewed).ToList();
            }
        }

        public async Task<List<EmailTemplate>> GetLastViewedEmailTemplates(string user)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(user, typeof(campaign_EmailTemplate).Name);
                var ids = lastViewedItems.Select(lastViewedItem => lastViewedItem.ItemId).ToList();
                var templates = await GetEmailTemplates(ids);
                templates.ForEach(template =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == template.Id);
                    if (lastViewedItem != null) template.DateViewed = lastViewedItem.Date;
                    template.Template = "Email Template";
                });
                return templates.OrderByDescending(template => template.DateViewed).ToList();
            }
        }

        public async Task<List<SmsTemplate>> GetLastViewedSmsTemplates(string user)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lastViewedItems = await GetLastViewedItemsForUser(user, typeof(campaign_SmsTemplate).Name);
                var ids = lastViewedItems.Select(lastViewedItem => lastViewedItem.ItemId).ToList();
                var templates = await GetSmsTemplates(ids);
                templates.ForEach(template =>
                {
                    var lastViewedItem = lastViewedItems.FirstOrDefault(item => item.ItemId == template.Id);
                    if (lastViewedItem != null) template.DateViewed = lastViewedItem.Date;
                    template.Template = "Sms Template";
                });
                return templates.OrderByDescending(template => template.DateViewed).ToList();
            }
        }

        public async Task<List<CampaignTemplate>> GetLastViewedTemplates(string user)
        {
            var smsList = await GetLastViewedSmsTemplates(user);
            var emailList = await GetLastViewedEmailTemplates(user);

            var list = new List<CampaignTemplate>(
                smsList.Select(
                    s => new CampaignTemplate
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Template = s.Template,
                        TemplateType = s.TemplateType,
                        CampaignTemplateType = s.CampaignTemplateType,
                        DateViewed = s.DateViewed,
                        IsActive = s.IsActive,
                        IsDeleted = s.IsDeleted,
                        CreatedBy = s.CreatedBy,
                        CreatedDate = s.CreatedDate,
                        ModifiedBy = s.ModifiedBy,
                        ModifiedDate = s.ModifiedDate
                    }
                )
                .ToList()
            );
            list.AddRange(
                emailList.Select(
                    m => new CampaignTemplate
                    {
                        Id = m.Id,
                        Name = m.Name,
                        Template = m.Template,
                        TemplateType = m.TemplateType,
                        CampaignTemplateType = m.CampaignTemplateType,
                        DateViewed = m.DateViewed,
                        IsActive = m.IsActive,
                        IsDeleted = m.IsDeleted,
                        CreatedBy = m.CreatedBy,
                        CreatedDate = m.CreatedDate,
                        ModifiedBy = m.ModifiedBy,
                        ModifiedDate = m.ModifiedDate
                    }
                )
                .ToList()
            );
            return list.OrderByDescending(i => i.DateViewed).Take(5).ToList();
        }

        #region Private methods

        private async Task<List<SmsTemplate>> GetSmsTemplates(List<int> ids)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await _smsTemplateRepository
                    .Where(template => ids.Contains(template.Id))
                    .Where(template => template.IsActive && !template.IsDeleted)
                    .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return templates;
            }
        }

        private async Task<List<LastViewedItem>> GetLastViewedItemsForUser(string user, string itemTypeName)
        {
            var detail = await _lastViewedService.GetLastViewedItemsForUser(user, itemTypeName, 5);
            return detail
                .Select(n => new LastViewedItem()
                {
                    ItemId = n.ItemId,
                    Date = n.Date
                }).ToList();
        }

        private async Task<List<Campaign>> GetCampaignsByIds(List<int> ids)
        {
            using (_dbContextScopeFactory.Create())
            {
                var campaigns = await _campaignRepository
                    .Where(campaign => ids.Contains(campaign.Id))
                    .Where(campaign => campaign.IsActive && !campaign.IsDeleted)
                    .ProjectTo<Campaign>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                RemoveDeletedCollections(campaigns);
                return campaigns;
            }
        }

        private void RemoveDeletedCollections(List<Campaign> campaigns)
        {
            foreach (var campaign in campaigns)
            {
                RemoveDeletedAudiences(campaign);
                RemoveDeletedEmails(campaign);
            }
        }

        private static void RemoveDeletedAudiences(Campaign campaign)
        {
            if (campaign.TargetAudiences == null) return;
            var list = campaign.TargetAudiences.Where(ta => ta.IsActive && !ta.IsDeleted).ToList();
            campaign.TargetAudiences = list;
        }

        private static void RemoveDeletedEmails(Campaign campaign)
        {
            if (campaign.CampaignEmails == null) return;
            var list = campaign.CampaignEmails.Where(e => e.IsActive && !e.IsDeleted).ToList();
            campaign.CampaignEmails = list;
        }

        private async Task<List<EmailTemplate>> GetEmailTemplates(List<int> ids)
        {
            var emailTemplates = await _emailTemplateRepository
                .Where(template => ids.Contains(template.Id))
                .Where(template => template.IsActive
                                   && !template.IsDeleted)
                .ProjectTo<EmailTemplate>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return emailTemplates;
        }
        #endregion
    }
}