using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class ProcessFacade : RemotingStatelessService, IProcessService
    {
        private const string CustomerServices = "Customer Services";

        private readonly ICampaignService _campaignService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly INoteService _noteService;
        private readonly ITargetAudienceService _targetAudienceService;

        public ProcessFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            ICampaignService campaignService,
            ITargetAudienceService targetAudienceService,
            INoteService noteService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _campaignService = campaignService;
            _targetAudienceService = targetAudienceService;
            _noteService = noteService;
        }

        public async Task<bool> AddEnquiryCampaign(CallbackCampaign callback)
        {
            Contract.Requires(callback != null);
            using (_dbContextScopeFactory.Create())
            {
                var campaign = await GetEnquiryCampaign(callback.LanguageName);
                return await AddEnquiryCampaignMember(campaign, callback);
            }
        }

        public async Task<bool> AddCallbackCampaign(CallbackCampaign callback)
        {
            Contract.Requires(callback != null);
            using (_dbContextScopeFactory.Create())
            {
                var campaign = await GetCallbackCampaign(callback.LanguageName);
                return await AddCallbackCampaingMember(campaign, callback);
            }
        }

        public async Task<int> AddBillingCampaign(string owner, int[] clientIds)
        {
            using (_dbContextScopeFactory.Create())
            {
                var campaign = await GetBillingCampaign(owner);
                return await AddCampaignClientMembers(campaign, clientIds);
            }
        }

        #region Private Methods
        private async Task<Campaign> GetBillingCampaign(string owner)
        {
            var campaignName = $"Collection Campaign {DateTimeHelper.SaNow:yyyy/MM/dd HH:mm:ss}";
            return await GetCampaign(campaignName, "Collection campaign created from age analysis screen.", owner, null);
        }

        private async Task<int> AddCampaignClientMembers(Campaign campaign, int[] clientIds)
        {
            using (_dbContextScopeFactory.Create())
            {
                var list = GetTargetAudienceList(campaign.Id, "Client", clientIds);
                var ids = await _targetAudienceService.AddTargetAudienceByList(list);
                return ids.Count;
            }
        }

        private async Task<Campaign> GetCampaign(string campaignName, string description, string owner, string role)
        {
            var campaigns = await _campaignService.GetCampaignsByName(campaignName);
            var campaign = campaigns.Count > 0
                ? campaigns[0]
                : GetNewCampaign(campaignName, description, owner, role);
            if (campaign.Id > 0)
                await _campaignService.EditCampaign(campaign);
            else
                campaign.Id = await _campaignService.AddCampaign(campaign);
            return campaign;
        }

        private Campaign GetNewCampaign(string campaignName, string description, string owner, string role)
        {
            DateTime now = DateTimeHelper.SaNow;
            var campaign = new Campaign
            {
                Id = 0,
                Name = campaignName,
                Description = description,
                CampaignCategory = CampaignCategoryEnum.Marketing,
                CampaignType = CampaignTypeEnum.Phone,
                CampaignStatus = CampaignStatusEnum.New,
                ProductId = 0,
                Owner = owner,
                Role = role,
                StartDate = new DateTime(now.Year, now.Month, 1),
                EndDate = null,
                IsActive = true,
                Paused = false
            };
            return campaign;
        }

        private async Task<Campaign> GetEnquiryCampaign(string languageName)
        {
            var campaignName = $"{languageName} Enquiries {DateTime.Today:yyyy/MM/dd}";
            return await GetCampaign(campaignName, "Enquiries received from Member Portal", null, CustomerServices);
        }

        private async Task<bool> AddEnquiryCampaignMember(Campaign campaign, CallbackCampaign callback)
        {
            var targetCompany = GetNewTargetCompany(callback);
            targetCompany.Id = await _targetAudienceService.AddCompanyTargetAudience(campaign.Id, targetCompany);
            var memberId = await FindTargetAudienceMember(campaign.Id, "Company", targetCompany.Id);
            await AddMemberNote(memberId, callback);

            return memberId > 0;
        }

        private TargetCompany GetNewTargetCompany(CallbackCampaign callback)
        {
            var company = new TargetCompany
            {
                Id = 0,
                CompanyName = callback.ClientName,
                MemberNumber = "",
                ContactName = callback.Username,
                Email = "",
                MobileNumber = callback.ContactNumber,
                PostalAddress = "",
                Unsubscribed = false,
                IsActive = true
            };
            return company;
        }

        private async Task<int> FindTargetAudienceMember(int campaignId, string itemType, int itemId)
        {
            var audienceMember = await _targetAudienceService.GetTargetAudience(campaignId, itemType, itemId);
            return audienceMember.Id;
        }

        private async Task AddMemberNote(int memberId, CallbackCampaign callback)
        {
            var note = await GetNote(memberId);
            if (note == null)
                await AddNote(memberId, callback.Comment);
            else
                await EditNote(note, callback.Comment);
        }

        private async Task<Note> GetNote(int itemId)
        {
            var notes = await _noteService.GetNotes("Recipient", itemId);
            return notes.Count > 0 ? notes[0] : null;
        }

        private async Task AddNote(int itemId, string comment)
        {
            var note = new Note
            {
                Id = 0,
                ItemId = itemId,
                ItemType = "Recipient",
                Text = comment
            };
            note.Id = await _noteService.AddNote(note);
        }

        private async Task EditNote(Note note, string comment)
        {
            note.Text += $"\r\n{comment}";
            await _noteService.EditNote(note);
        }

        private async Task<Campaign> GetCallbackCampaign(string languageName)
        {
            var campaignName = $"{languageName} Callback Requests {DateTime.Today:yyyy/MM/dd}";
            return await GetCampaign(campaignName, "Callback requests received from Member Portal", null,
                CustomerServices);
        }

        private async Task<bool> AddCallbackCampaingMember(Campaign campaign, CallbackCampaign callback)
        {
            var targetPerson = new TargetPerson
            {
                Id = 0,
                ContactName = callback.Username,
                IdNumber = "",
                Email = "",
                MobileNumber = callback.ContactNumber,
                Unsubscribed = false,
                IsActive = true
            };

            targetPerson.Id = await _targetAudienceService.AddPersonTargetAudience(campaign.Id, targetPerson);
            var memberId = await FindTargetAudienceMember(campaign.Id, "Person", targetPerson.Id);
            await AddMemberNote(memberId, callback);
            return memberId > 0;
        }


        private List<TargetAudience> GetTargetAudienceList(int campaignId, string itemType, int[] itemIds)
        {
            return itemIds.Select(itemId => GetNewTargetAudienceMember(campaignId, itemType, itemId))
                .ToList();
        }

        private TargetAudience GetNewTargetAudienceMember(int campaignId, string itemType, int itemId)
        {
            var audience = GetNewTargetAudienceMember(itemType, itemId);
            audience.CampaignId = campaignId;
            return audience;
        }

        private TargetAudience GetNewTargetAudienceMember(string itemType, int itemId)
        {
            var audience = new TargetAudience
            {
                Id = 0,
                ItemType = itemType,
                ItemId = itemId,
                IsActive = true
            };
            return audience;
        }

        private TargetAudience GetNewAudienceMember(int campaignId, string itemType, int itemId)
        {
            var member = new TargetAudience
            {
                Id = 0,
                CampaignId = campaignId,
                ItemType = itemType,
                ItemId = itemId,
                IsActive = true
            };
            return member;
        }
        #endregion
    }
}