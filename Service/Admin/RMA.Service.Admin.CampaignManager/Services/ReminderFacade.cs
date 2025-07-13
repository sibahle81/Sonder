using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class ReminderFacade : RemotingStatelessService, IReminderService
    {



        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly ISendEmailService _emailService;
        private readonly IRepository<campaign_Campaign> _campaignRepository;
        private readonly IRepository<campaign_Reminder> _reminderRepository;
        private readonly IMapper _mapper;

        public ReminderFacade(
            StatelessServiceContext context,
            ISendEmailService emailService,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_Campaign> campaignRepository,
            IRepository<campaign_Reminder> reminderRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _emailService = emailService;
            _campaignRepository = campaignRepository;
            _reminderRepository = reminderRepository;
            _mapper = mapper;
        }

        public async Task<Reminder> GetCampaignReminder(int campaignId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _reminderRepository
                    .OrderByDescending(o => o.Id)
                    .Where(cmp => cmp.CampaignId == campaignId)
                    .ProjectTo<Reminder>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync();
            }
        }

        public async Task<int> AddCampaignReminder(Reminder reminder)
        {
            RmaIdentity.DemandPermission(Permissions.AddCampaign);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_Reminder>(reminder);
                _reminderRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task EditCampaignReminder(Reminder reminder)
        {
            RmaIdentity.DemandPermission(Permissions.EditCampaign);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_Reminder>(reminder);
                _reminderRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> SendReminders()
        {
            var reminders = await GetCampaignReminders();
            return await SendCampaignReminders(reminders);
        }

        private async Task<int> SendCampaignReminders(List<CampaignEmailReminder> reminders)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var count = 0;
                foreach (var reminder in reminders)
                {
                    if (reminder.CampaignOwner.IsValidEmail())
                    {
                        var request = GetEmailRequest(reminder);
                        var code = await _emailService.SendEmail(request);
                        if (code == 200)
                        {
                            var entity = await _reminderRepository.SingleAsync(r => r.Id == reminder.ReminderId);
                            entity.ReminderActive = false;
                            _reminderRepository.Update(entity);
                            count++;
                        }
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }

        private SendMailRequest GetEmailRequest(CampaignEmailReminder reminder)
        {
            var request = new SendMailRequest
            {
                Subject = "Campaing Reminder",
                Recipients = reminder.CampaignOwner,
                Body = GetReminderEmailBody(reminder.CampaignName),
                IsHtml = true,
                CreatedBy = "BackEndProcess",
                ModifiedBy = "BackEndProcess"
            };
            return request;
        }

        private static string GetReminderEmailBody(string campaignName)
        {
            var html = "<p>Good day</p>"
                       + $"<p>This is your scheduled campaign reminder for {campaignName}.</p>"
                       + "<p>Kind regards,<br/>The RMA Team</p>";
            return html;
        }

        private async Task<List<CampaignEmailReminder>> GetCampaignReminders()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var now = DateTime.Now;
                var reminders = await (
                        from c in _campaignRepository
                        where c.IsActive
                              && c.CampaignStatus != CampaignStatusEnum.Completed
                        join r in _reminderRepository
                            on new { CampaignId = c.Id, c.IsActive }
                            equals new { r.CampaignId, r.IsActive }
                        where r.ReminderActive && r.ReminderDate <= now
                        select new CampaignEmailReminder
                        {
                            ReminderId = r.Id,
                            CampaignId = c.Id,
                            CampaignName = c.Name,
                            CampaignOwner = c.Owner
                        }
                    )
                    .ToListAsync();
                return reminders;
            }
        }
    }
}