using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class SLAFacade : RemotingStatelessService, ISLAService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_SlaItemTypeConfiguration> _slaConfigurationRepository;
        private readonly IRepository<common_SlaStatusChangeAudit> _slaStatusChangeRepository;
        private readonly IUserService _userService;
        private readonly IUserReminderService _userReminderService;
        private readonly ISendEmailService _emailService;
        private readonly IPublicHolidayService _publicHolidayService;
        private readonly IMapper _mapper;

        public SLAFacade(IDbContextScopeFactory dbContextScopeFactory,
        IRepository<common_SlaItemTypeConfiguration> slaConfigurationRepository,
        IRepository<common_SlaStatusChangeAudit> slaStatusChangeRepository,
        IUserService userService,
        IUserReminderService userReminderService,
        ISendEmailService emailService,
        IPublicHolidayService publicHolidayService,
        IMapper mapper,
        StatelessServiceContext context) : base(context)
        {
            _slaConfigurationRepository = slaConfigurationRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _slaStatusChangeRepository = slaStatusChangeRepository;
            _userService = userService;
            _userReminderService = userReminderService;
            _emailService = emailService;
            _publicHolidayService = publicHolidayService;
            _mapper = mapper;
        }

        public async Task HandleSLAStatusChangeAudit(SlaStatusChangeAudit slaStatusChangeAudit)
        {
            Contract.Requires(slaStatusChangeAudit != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingSlaStatusChangeAudits = await _slaStatusChangeRepository.Where(s => s.ItemId == slaStatusChangeAudit.ItemId && s.SLAItemType == slaStatusChangeAudit.SLAItemType).ToListAsync();

                if (existingSlaStatusChangeAudits?.Count > 0)
                {
                    (existingSlaStatusChangeAudits.Where(e => e.EffictiveTo == null).ToList())?.ForEach(a => a.EffictiveTo = slaStatusChangeAudit.EffectiveFrom);
                    _slaStatusChangeRepository.Update(existingSlaStatusChangeAudits);
                    _slaStatusChangeRepository.Create(_mapper.Map<common_SlaStatusChangeAudit>(slaStatusChangeAudit));
                }
                else
                {
                    var entity = _mapper.Map<common_SlaStatusChangeAudit>(slaStatusChangeAudit);
                    _slaStatusChangeRepository.Create(entity);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<SlaItemTypeConfiguration> GetSLAItemTypeConfiguration(SLAItemTypeEnum slaItemType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var slaItemTypeConfiguration = await _slaConfigurationRepository.FirstOrDefaultAsync(a => a.SLAItemType == slaItemType);
                return _mapper.Map<SlaItemTypeConfiguration>(slaItemTypeConfiguration);
            }
        }

        public async Task<List<SlaItemTypeConfiguration>> GetSLAItemTypeConfigurations()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var slaItemTypeConfigurations = await _slaConfigurationRepository.ToListAsync();
                return _mapper.Map<List<SlaItemTypeConfiguration>>(slaItemTypeConfigurations);
            }
        }

        public async Task<List<SlaStatusChangeAudit>> GetSLAStatusChangeAudits(SLAItemTypeEnum slaItemType, int itemId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var slaStatusChangeAudits = await _slaStatusChangeRepository.Where(a => a.SLAItemType == slaItemType && a.ItemId == itemId).ToListAsync();
                return _mapper.Map<List<SlaStatusChangeAudit>>(slaStatusChangeAudits);
            }
        }

        public async Task<PagedRequestResult<SlaStatusChangeAudit>> GetPagedSLAStatusChangeAudits(SlaStatusChangeAuditSearchRequest slaStatusChangeAuditSearchRequest)
        {
            Contract.Requires(slaStatusChangeAuditSearchRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = !string.IsNullOrEmpty(slaStatusChangeAuditSearchRequest.PagedRequest.SearchCriteria) ? Convert.ToInt32(slaStatusChangeAuditSearchRequest.PagedRequest.SearchCriteria) : 0;

                var slaStatusChangeAudits = await _slaStatusChangeRepository.Where(a => a.SLAItemType == slaStatusChangeAuditSearchRequest.SLAItemType && a.ItemId == filter)
                    .ToPagedResult(slaStatusChangeAuditSearchRequest.PagedRequest);

                var data = _mapper.Map<List<SlaStatusChangeAudit>>(slaStatusChangeAudits.Data);

                return new PagedRequestResult<SlaStatusChangeAudit>
                {
                    Page = slaStatusChangeAuditSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(slaStatusChangeAudits.RowCount / (double)slaStatusChangeAuditSearchRequest.PagedRequest.PageSize),
                    RowCount = slaStatusChangeAudits.RowCount,
                    PageSize = slaStatusChangeAuditSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }

        public async Task EscalateOverdueSlas()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var slaConfigurations = _slaConfigurationRepository.Where(s => s.AmberSlaNotificationPermission != null || s.RedSlaNotificationPermission != null).ToList();
                var activeSlas = _slaStatusChangeRepository.Where(s => s.EffictiveTo == null).ToList();
                var publicHolidays = await _publicHolidayService.GetPublicHolidays();

                var userReminders = new List<UserReminder>();
                var sendMailRequests = new List<SendMailRequest>();

                foreach (var activeSla in activeSlas)
                {
                    var slaConfiguration = slaConfigurations.Find(s =>
                        s.SLAItemType == activeSla.SLAItemType);

                    if (slaConfiguration != null)
                    {
                        var amberEscalateToUsers = slaConfiguration.AmberSlaNotificationPermission != null
                            ? await _userService.SearchUsersByPermission(slaConfiguration.AmberSlaNotificationPermission)
                            : new List<User>();

                        var redEscalateToUsers = slaConfiguration.RedSlaNotificationPermission != null
                            ? await _userService.SearchUsersByPermission(slaConfiguration.RedSlaNotificationPermission)
                            : new List<User>();

                        var slaStart = (await _slaStatusChangeRepository.FirstOrDefaultAsync(s => s.ItemId == activeSla.ItemId)).EffectiveFrom;
                        var now = DateTimeHelper.SaNow;

                        // Calculate working hours difference
                        double workingDaysElapsed = CalculateWorkingDays(slaStart, now, publicHolidays);

                        var recipients = string.Empty;

                        if (workingDaysElapsed >= slaConfiguration.NumberOfDaysRedSla)
                        {
                            recipients = await HandleSlaEscalation(activeSla, redEscalateToUsers, slaConfiguration, "Red", workingDaysElapsed);
                        }
                        else if (workingDaysElapsed >= slaConfiguration.NumberOfDaysAmberSla && workingDaysElapsed < slaConfiguration.NumberOfDaysRedSla)
                        {
                            recipients = await HandleSlaEscalation(activeSla, amberEscalateToUsers, slaConfiguration, "Amber", workingDaysElapsed);
                        }
                    }
                }
            }
        }

        private double CalculateWorkingDays(DateTime start, DateTime end, List<PublicHoliday> publicHolidays)
        {
            double totalWorkingHours = 0;
            TimeSpan workingDayStart = new TimeSpan(8, 0, 0); // 8 AM
            TimeSpan workingDayEnd = new TimeSpan(16, 0, 0); // 4 PM
            var currentDate = start.Date;

            while (currentDate <= end.Date)
            {
                if (currentDate.DayOfWeek != DayOfWeek.Saturday &&
                    currentDate.DayOfWeek != DayOfWeek.Sunday &&
                    !publicHolidays.Any(h => h.HolidayDate == currentDate))
                {
                    var workStart = currentDate.Add(workingDayStart);
                    var workEnd = currentDate.Add(workingDayEnd);

                    var effectiveStart = (start > workStart && start < workEnd) ? start : workStart;
                    var effectiveEnd = (end < workEnd && end > workStart) ? end : workEnd;

                    if (effectiveEnd > effectiveStart)
                    {
                        totalWorkingHours += (effectiveEnd - effectiveStart).TotalHours;
                    }
                }

                currentDate = currentDate.AddDays(1);
            }

            return totalWorkingHours / 8; // Convert to working days
        }

        private async Task<string> HandleSlaEscalation(common_SlaStatusChangeAudit sla, List<User> escalateToUsers, common_SlaItemTypeConfiguration slaConfiguration, string slaType, double workingDaysElapsed)
        {
            var recipients = new StringBuilder();
            var linkUrl = GetLinkUrlBySlaItemType(sla.SLAItemType);
            var userReminders = new List<UserReminder>();
            var sendMailRequests = new List<SendMailRequest>();

            foreach (var user in escalateToUsers)
            {
                var message = workingDaysElapsed > slaConfiguration.NumberOfDaysRedSla
                    ? $"{(int)(workingDaysElapsed - slaConfiguration.NumberOfDaysRedSla)} days"
                    : "less than 1 working day";

                var userReminder = new UserReminder
                {
                    UserReminderType = UserReminderTypeEnum.SystemNotification,
                    AssignedToUserId = user.Id,
                    Text = $"{sla.SLAItemType} SLA Exceeded: {slaType} SLA exceeded by {message}",
                    LinkUrl = $"{linkUrl}/{sla.ItemId}",
                    CreatedBy = "SLA Automated Escalation",
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedBy = "SLA Automated Escalation",
                    ModifiedDate = DateTimeHelper.SaNow
                };

                if (Enum.TryParse(sla.SLAItemType.ToString(), true, out UserReminderItemTypeEnum userReminderType))
                {
                    userReminder.UserReminderItemType = userReminderType;
                }

                userReminders.Add(userReminder);

                if ((slaType == "Red" && slaConfiguration.IncludeEmailNotificationRedSla.GetValueOrDefault()) ||
                    (slaType == "Amber" && slaConfiguration.IncludeEmailNotificationAmberSla.GetValueOrDefault()))
                {
                    recipients.Append(user.Email).Append(';');
                }
            }

            if (!string.IsNullOrEmpty(recipients.ToString()))
            {
                var sendMailRequest = new SendMailRequest
                {
                    ItemId = sla.ItemId,
                    ItemType = $"{sla.SLAItemType}",
                    Recipients = recipients.ToString(),
                    Body = $"{sla.SLAItemType} SLA Exceeded: {slaType} SLA exceeded by {workingDaysElapsed - slaConfiguration.NumberOfDaysRedSla} days",
                    FromAddress = "noreply@randmutual.co.za",
                    Subject = $"{slaType} {sla.SLAItemType} SLA Escalation"
                };

                sendMailRequests.Add(sendMailRequest);
            }

            if (userReminders.Count > 0)
            {
                await _userReminderService.CreateUserReminders(userReminders);

                if (sendMailRequests.Count > 0)
                {
                    _ = Task.Run(() => SendEmailNotifications(sendMailRequests));
                }
            }

            return recipients.ToString();
        }

        private async Task SendEmailNotifications(List<SendMailRequest> sendMailRequests)
        {
            foreach (var sendMailRequest in sendMailRequests)
            {
                await _emailService.SendEmail(sendMailRequest);
            }
        }

        private static string GetLinkUrlBySlaItemType(SLAItemTypeEnum slaItemType)
        {
            var linkUrl = string.Empty;
            switch (slaItemType)
            {
                case SLAItemTypeEnum.Lead:
                    break;
                case SLAItemTypeEnum.Quote:
                    linkUrl = "/clientcare/quote-manager/quote-view";
                    break;
                case SLAItemTypeEnum.Member:
                    break;
                case SLAItemTypeEnum.Policy:
                    break;
                case SLAItemTypeEnum.Claim:
                    break;
                default:
                    break;
            }

            return linkUrl;
        }
    }
}
