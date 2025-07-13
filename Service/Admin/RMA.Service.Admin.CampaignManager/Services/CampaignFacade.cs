using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class CampaignFacade : RemotingStatelessService, ICampaignService
    {
        private readonly IRepository<campaign_Campaign> _campaignRepository;

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IEmailService _emailService;
        private readonly IAuditWriter _auditWriter;
        private readonly INoteService _noteService;
        private readonly ISmsService _smsService;
        private readonly ITargetAudienceService _targetAudienceService;
        private readonly IMapper _mapper;

        public CampaignFacade(
            StatelessServiceContext serviceContext,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_Campaign> campaignRepository,
            IAuditWriter auditWriter,
            INoteService noteService,
            ITargetAudienceService targetAudienceService,
            IEmailService emailService,
            ISmsService smsService,
            IMapper mapper        ) : base(serviceContext)
        {
            _auditWriter = auditWriter;
            _noteService = noteService;
            _targetAudienceService = targetAudienceService;
            _emailService = emailService;
            _smsService = smsService;
            _campaignRepository = campaignRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _mapper = mapper;
        }

        public async Task<List<Campaign>> GetCampaigns()
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var campaigns = await _campaignRepository
                    .ProjectTo<Campaign>(_mapper.ConfigurationProvider)
                    .Where(campaign => campaign.IsActive && !campaign.IsDeleted)
                    .ToListAsync();
                RemoveDeletedCollections(campaigns);
                return campaigns;
            }
        }

        public async Task<PagedRequestResult<Campaign>> SearchCampaigns(PagedRequest request)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var campaigns = await _campaignRepository
                    .Where(campaign => campaign.IsActive && !campaign.IsDeleted)
                    .Where(campaign =>
                        campaign.Name.Contains(request.SearchCriteria)
                        || campaign.Description.Contains(request.SearchCriteria)
                    )
                    .ToPagedResult<campaign_Campaign, Campaign>(request, _mapper);
                RemoveDeletedCollections(campaigns.Data);
                return campaigns;
            }
        }

        public async Task<List<Campaign>> GetCampaignsByOwner(string owner)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var campaigns = await _campaignRepository
                    .ProjectTo<Campaign>(_mapper.ConfigurationProvider)
                    .Where(campaign => campaign.Owner.Equals(owner, StringComparison.OrdinalIgnoreCase))
                    .Where(campaign => campaign.IsActive && !campaign.IsDeleted)
                    .ToListAsync();
                RemoveDeletedCollections(campaigns);
                return campaigns;
            }
        }

        public async Task<List<Campaign>> GetCampaignsByOwners(string[] owners)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var campaigns = await _campaignRepository
                    .ProjectTo<Campaign>(_mapper.ConfigurationProvider)
                    .Where(campaign => campaign.IsActive && !campaign.IsDeleted)
                    .Where(campaign => owners.Contains(campaign.Owner))
                    .ToListAsync();
                RemoveDeletedCollections(campaigns);
                return campaigns;
            }
        }

        public async Task<List<Campaign>> GetCampaignsByRole(string role)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var campaigns = await _campaignRepository
                    .ProjectTo<Campaign>(_mapper.ConfigurationProvider)
                    .Where(campaign => campaign.Role.Equals(role, StringComparison.OrdinalIgnoreCase))
                    .Where(campaign => campaign.IsActive && !campaign.IsDeleted)
                    .ToListAsync();
                RemoveDeletedCollections(campaigns);
                return campaigns;
            }
        }

        public async Task<Campaign> GetCampaign(int id)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.Create())
            {
                var campaign = await _campaignRepository
                    .ProjectTo<Campaign>(_mapper.ConfigurationProvider)
                    .SingleAsync(c => c.Id == id, $"Could not find Campaign with id = {id}");
                RemoveDeletedAudiences(campaign);
                RemoveDeletedCollections(campaign);
                await _auditWriter.AddLastViewed<campaign_Campaign>(campaign.Id);
                campaign = await LoadTemplates(campaign);
                return campaign;
            }
        }

        public async Task<int> AddCampaign(Campaign campaign)
        {
            Contract.Requires(campaign != null);
            RmaIdentity.DemandPermission(Permissions.AddCampaign);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                campaign.IsActive = true;
                campaign.IsDeleted = false;
                var entity = _mapper.Map<campaign_Campaign>(campaign);
                _campaignRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                var entityCampaign = _mapper.Map<Campaign>(entity);
                await AddTargetsNote(entityCampaign);
                await AddCampaignNote(entityCampaign, campaign.Note);
                await _auditWriter.AddLastViewed<campaign_Campaign>(entity.Id);
                return entity.Id;
            }
        }

        public async Task EditCampaign(Campaign campaign)
        {
            Contract.Requires(campaign != null);
            RmaIdentity.DemandPermission(Permissions.EditCampaign);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = _mapper.Map<campaign_Campaign>(campaign);
                _campaignRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            await _emailService.ModifyCampaignEmails(campaign.CampaignEmails);
            await _smsService.ModifyCampaignSmses(campaign.CampaignSmses);
        }

        public async Task<int> CopyCampaign(int id)
        {
            RmaIdentity.DemandPermission(Permissions.AddCampaign);
            using (_dbContextScopeFactory.Create())
            {
                var campaign = await CopyCampaignPrivate(id);
                await _auditWriter.AddLastViewed<campaign_Campaign>(campaign.Id);
                return campaign.Id;
            }
        }

        public async Task ReviewCampaign(Campaign campaign)
        {

            Contract.Requires(campaign != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_Campaign>(campaign);
                entity.CampaignStatus = GetCampaignStatus(entity.CampaignStatus);
                _campaignRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _auditWriter.AddLastViewed<campaign_Campaign>(campaign.Id);
            }
        }

        public async Task Delete(int id)
        {
            RmaIdentity.DemandPermission(Permissions.RemoveCampaign);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var campaign = await GetCampaign(id);
                campaign.IsActive = false;
                campaign.IsDeleted = true;
                var entity = _mapper.Map<campaign_Campaign>(campaign);
                _campaignRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        #region Private methods
        private async Task<Campaign> LoadTemplates(Campaign campaign)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                switch (campaign.CampaignType)
                {
                    case CampaignTypeEnum.Email:
                        var email = await _emailService.GetCampaignEmail(campaign.Id);
                        if (email != null)
                        {
                            campaign.CampaignEmails.Add(email);
                        }
                        break;
                    case CampaignTypeEnum.SMS:
                        var sms = await _smsService.GetCampaignSms(campaign.Id);
                        if (sms != null)
                        {
                            campaign.CampaignSmses.Add(sms);
                        }
                        break;
                }
                return campaign;
            }
        }

        private static void RemoveDeletedCollections(List<Campaign> campaigns)
        {
            foreach (var campaign in campaigns)
            {
                RemoveDeletedCollections(campaign);
            }
        }

        private static void RemoveDeletedCollections(Campaign campaign)
        {
            RemoveDeletedAudiences(campaign);
            RemoveDeletedEmails(campaign);
        }

        private static void RemoveDeletedAudiences(Campaign campaign)
        {
            if (campaign.TargetAudiences == null) return;
            campaign.TargetAudiences = campaign.TargetAudiences.Where(ta => ta.IsActive && !ta.IsDeleted).ToList();
        }

        private static void RemoveDeletedEmails(Campaign campaign)
        {
            if (campaign.CampaignEmails == null) return;
            campaign.CampaignEmails = campaign.CampaignEmails.Where(e => e.IsActive && !e.IsDeleted).ToList();
        }

        private async Task AddTargetsNote(Campaign campaign)
        {
            if (campaign.CollectionDate > DateTime.MinValue)
                await AddCampaignNote(campaign, $"Collection Date: {campaign.CollectionDate:yyyy-MM-dd}");
            if (campaign.CollectionAmount > 0.00M)
                await AddCampaignNote(campaign, $"Target Amount: {campaign.CollectionAmount:#,00.00}");
            if (!string.IsNullOrEmpty(campaign.PhoneNumber))
                await AddCampaignNote(campaign, $"Contact Number: {campaign.PhoneNumber}");
            if (!string.IsNullOrEmpty(campaign.EmailAddress))
                await AddCampaignNote(campaign, $"Email Address: {campaign.EmailAddress}");
        }

        private async Task AddCampaignNote(Campaign campaign, string text)
        {
            if (string.IsNullOrEmpty(text)) return;
            var note = new Note
            {
                Id = 0,
                ItemType = "Campaign",
                ItemId = campaign.Id,
                Text = text
            };
            await _noteService.AddNote(note);
        }

        private async Task<Campaign> CopyCampaignPrivate(int campaignId)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var sourceCampaign = await _campaignRepository
                    .ProjectTo<Campaign>(_mapper.ConfigurationProvider)
                    .Where(s => s.Id == campaignId)
                    .SingleAsync($"Campaign with id {campaignId} could not be found.");

                sourceCampaign.Name = $"Copy of {sourceCampaign.Name}";
                sourceCampaign.IsActive = true;
                sourceCampaign.IsDeleted = false;
                sourceCampaign.TargetAudiences = null;
                sourceCampaign.CampaignEmails = null;
                sourceCampaign.CampaignStatus = CampaignStatusEnum.New;
                sourceCampaign.Paused = false;

                var entity = _mapper.Map<campaign_Campaign>(sourceCampaign);
                _campaignRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _targetAudienceService.CopyTargetAudience(campaignId, entity.Id);
                await _emailService.CopyEmails(campaignId, entity.Id);
                await _smsService.CopySmses(campaignId, entity.Id);
                return _mapper.Map<Campaign>(entity);
            }
        }

        private static CampaignStatusEnum GetCampaignStatus(CampaignStatusEnum status)
        {
            switch (status)
            {
                case CampaignStatusEnum.New:
                case CampaignStatusEnum.Updated:
                    return CampaignStatusEnum.MarketingApprovalRequested;
                case CampaignStatusEnum.MarketingApproved:
                    return CampaignStatusEnum.LegalApprovalRequested;
                default:
                    return status;
            }
        }

        public async Task<List<Campaign>> GetCampaignsByName(string name)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaign);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var campaigns = await _campaignRepository
                    .Where(campaign => campaign.IsActive && !campaign.IsDeleted)
                    .Where(campaign =>
                        campaign.Name.Contains(name)
                        || campaign.Description.Contains(name)
                    )
                    .ProjectTo<Campaign>(_mapper.ConfigurationProvider).ToListAsync();
                RemoveDeletedCollections(campaigns);
                return campaigns;
            }
        }
    }
    #endregion
}