using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Integrations.Contracts.Interfaces.Sms;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class SendSmsFacade : RemotingStatelessService, ISendSmsService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_SmsTemplate> _smsTemplatesRepository;
        private readonly IRepository<campaign_SmsAudit> _smsAuditRepository;
        private readonly IRepository<campaign_BulkSmsRequestDetail> _bulkSmsRequestDetailRepository;
        private readonly IRepository<campaign_BulkSmsRequestHeader> _bulkSmsRequestHeaderRepository;
        private readonly IRepository<campaign_SmsAuditDetail> _campaignSmsAuditDetailRepository;
        private readonly ISmsRequestService _smsRequestService;
        private readonly IConfigurationService _configurationService;
        private readonly IMapper _mapper;
        private const string CheckNumbers124535 = "CheckNumbers124535";
        public SendSmsFacade(
            StatelessServiceContext context,
            IConfigurationService configurationService,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_SmsTemplate> smsTemplatesRepository,
            IRepository<campaign_SmsAudit> smsAuditRepository,
            IRepository<campaign_BulkSmsRequestDetail> bulkSmsRequestDetailRepository,
            IRepository<campaign_BulkSmsRequestHeader> bulkSmsRequestHeaderRepository,
            IRepository<campaign_SmsAuditDetail> campaignSmsAuditDetailRepository,
            ISmsRequestService smsRequestService,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _smsTemplatesRepository = smsTemplatesRepository;
            _smsAuditRepository = smsAuditRepository;
            _bulkSmsRequestDetailRepository = bulkSmsRequestDetailRepository;
            _bulkSmsRequestHeaderRepository = bulkSmsRequestHeaderRepository;
            _smsRequestService = smsRequestService;
            _configurationService = configurationService;
            _campaignSmsAuditDetailRepository = campaignSmsAuditDetailRepository;
            _mapper = mapper;
        }

        public async Task<int> SendTemplateSms(TemplateSmsRequest sendRequest)
        {
            if (sendRequest == null) return 0;
            if (await _configurationService.IsFeatureFlagSettingEnabled(CheckNumbers124535))
            {
                List<string> invalidNumbers = new List<string>();
                invalidNumbers = sendRequest.SmsNumbers.Where(cell => (string.IsNullOrEmpty(cell) || !cell.IsValidPhone())).ToList();
                invalidNumbers.ForEach(n => sendRequest.SmsNumbers.Remove(n));
                if (sendRequest.SmsNumbers.Count == 0) return 0;
            }

            SmsTemplate template;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                template = await _smsTemplatesRepository
                   .Where(t => t.TemplateType == (TemplateTypeEnum)sendRequest.TemplateId || t.Name == sendRequest.Name)
                   .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                   .SingleAsync($"Sms template with id {sendRequest.TemplateId} could not be found.");
            }
            var message = template.Template;
            foreach (var token in sendRequest.Tokens)
            {
                message = message.Replace($"[{token.Key}]", token.Value);
            }
            var request = new SendSmsRequest
            {
                Department = sendRequest.Department,
                BusinessArea = BusinessAreaEnum.TemplatedSms,
                Message = message,
                WhenToSend = DateTimeHelper.SaNow,
                LastChangedBy = "",
                SmsNumbers = sendRequest.SmsNumbers,
                ItemId = sendRequest.ItemId,
                ItemType = sendRequest.ItemType
            };
            return await SendSmsMessage(request);
        }

        public async Task<int> SendSmsMessage(SendSmsRequest request)
        {
            var result = new List<SendSmsRequestResult>();
            if (request == null) return await Task.FromResult(0);

            var env = Environment.GetEnvironmentVariable("EnvName");

            var dailyTestEnvironmentSMSLimit = (await _configurationService.GetModuleSetting(SystemSettings.DailyTestEnvironmentSMSLimit)).ToInt(10);

            var sentToday = await SentTodayCount();

            if (sentToday > dailyTestEnvironmentSMSLimit && !env.Contains("PROD"))
            {
                foreach (var item in request.SmsNumbers)
                {
                    result.Add(new SendSmsRequestResult()
                    {
                        IsSuccess = false,
                        ProcessDescription = $"SendSmsMessage: SentToday [{sentToday}], DailyTestEnvironmentSMSLimit [{dailyTestEnvironmentSMSLimit}] has been reached.",
                        SmsNumber = item
                    });
                }
            }
            else
            {
                result = await _smsRequestService.SendSmsMessage(request);
            }

            //ToDo : insert requests into the audit table

            foreach (var item in result)
            {
                await AuditSms(request, item);
            }
            return await Task.FromResult(1);
        }

        private async Task<int> SentTodayCount()
        {
            var sentToday = 0;
            var startOfToday = DateTimeHelper.SaNow.StartOfTheDay();
            var endOfToday = DateTimeHelper.SaNow.EndOfTheDay();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                sentToday = (from a in _smsAuditRepository
                             .Where(a => (a.IsSuccess != null && a.IsSuccess == true) && (a.CreatedDate > startOfToday && a.CreatedDate < endOfToday))
                             select a).Count();
            }

            return await Task.FromResult(sentToday);
        }

        private async Task<int> AuditSms(SendSmsRequest smsRequest, SendSmsRequestResult smsRequestResult)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var smsAudit = new SmsAudit()
                {
                    ItemId = smsRequest.ItemId,
                    ItemType = smsRequest.ItemType,
                    Message = smsRequest.Message,
                    SmsNumbers = smsRequestResult.SmsNumber,
                    IsActive = true,
                    IsDeleted = false,
                    IsSuccess = smsRequestResult.IsSuccess,
                    ProcessDescription = smsRequestResult.ProcessDescription,
                    Department = smsRequest.Department.DisplayAttributeValue(),
                    BusinessArea = smsRequest.BusinessArea.DisplayAttributeValue(),
                    ModifiedBy = RmaIdentity.Username,
                    ModifiedDate = DateTimeHelper.SaNow,
                    CreatedBy = RmaIdentity.Username,
                    CreatedDate = DateTimeHelper.SaNow,
                    SmsReference = smsRequestResult.SmsReference,
                };

                var entity = _mapper.Map<campaign_SmsAudit>(smsAudit);
                _smsAuditRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }
        public async Task<PagedRequestResult<SmsAudit>> GetSmsAudit(PagedRequest request)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var returnResult = new PagedRequestResult<SmsAudit>();

                var resultString = Regex.Match(request.SearchCriteria, @"\d+").Value;
                var itemId = Int32.Parse(resultString);
                var itemType = string.Concat(request.SearchCriteria.Where(char.IsLetter));

                var emailAuditEntity = await _smsAuditRepository
                    .Where(t => t.ItemId == itemId && t.ItemType == itemType)
                    .ToPagedResult(request);

                if (emailAuditEntity.Data.Count > 0)
                {
                    returnResult = new PagedRequestResult<SmsAudit>
                    {
                        Page = emailAuditEntity.Page,
                        PageCount = emailAuditEntity.PageCount,
                        RowCount = emailAuditEntity.RowCount,
                        PageSize = emailAuditEntity.PageSize,
                        Data = new List<SmsAudit>()
                    };

                    var mappedSmsAudit = _mapper.Map<List<SmsAudit>>(emailAuditEntity.Data);
                    foreach (var item in mappedSmsAudit)
                    {
                        returnResult.Data.Add(item);
                    }
                }
                return returnResult;
            }
        }

        public async Task<bool> SmsAlreadySent(int itemId, string itemType, string message, string numbers)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _smsAuditRepository.FirstOrDefaultAsync(a => a.ItemId == itemId && a.Message == message && a.ItemType == itemType && a.SmsNumbers == numbers);
                return result != null;
            }
        }

        public async Task SendBulkSms(List<SendSmsRequest> bulkSms)
        {
            Contract.Requires(bulkSms != null);

            if (bulkSms.Count == 0) return;

            var env = Environment.GetEnvironmentVariable("EnvName");
            var isTestEnvironment = (string.IsNullOrEmpty(env) || !env.Contains("PROD"));

            var dailyTestEnvironmentSMSLimit = (await _configurationService.GetModuleSetting(SystemSettings.DailyTestEnvironmentSMSLimit)).ToInt(10);

            var sentToday = await SentTodayCount();

            foreach (var sms in bulkSms)
            {
                if (isTestEnvironment && sentToday < dailyTestEnvironmentSMSLimit)
                {
                    var res = await _smsRequestService.SendSmsMessage(sms);

                    sentToday = sentToday + res.Count;

                    foreach (var item in res)
                    {
                        await AuditSms(sms, item);
                    }
                    await UpdateBulkSmsRequestDetail(sms, res.FirstOrDefault());
                }
                else
                {
                    var res = new List<SendSmsRequestResult>();

                    foreach (var item in sms.SmsNumbers)
                    {
                        res.Add(new SendSmsRequestResult()
                        {
                            IsSuccess = false,
                            ProcessDescription = $"SendBulk: SentToday [{sentToday}], DailyTestEnvironmentSMSLimit [{dailyTestEnvironmentSMSLimit}] has been reached.",
                            SmsNumber = item
                        });
                    }

                    foreach (var item in res)
                    {
                        await AuditSms(sms, item);
                    }
                    await UpdateBulkSmsRequestDetail(sms, res.FirstOrDefault());
                }
            }
        }

        public async Task<bool> ProcessBulkSmsRequest()
        {
            var bulkSms = new List<SendSmsRequest>();
            var outstanding = 0;

            do
            {
                bulkSms = new List<SendSmsRequest>();

                using (_dbContextScopeFactory.Create())
                {
                    bulkSms = await _bulkSmsRequestDetailRepository.SqlQueryAsync<SendSmsRequest>(DatabaseConstants.ProcessBulkSmsRequestPerBatch);
                }

                if (bulkSms.Count > 0)
                {
                    bulkSms.ForEach(a => a.SmsNumbers = new List<string>() { a.SmsNumber });

                    await SendBulkSms(bulkSms);
                    int smsBatch = bulkSms.Select(a => a.SmsBatch).FirstOrDefault();
                    outstanding = smsBatch - bulkSms.Count;
                }

            } while (outstanding > 0);

            return await Task.FromResult(true);
        }

        private async Task UpdateBulkSmsRequestDetail(SendSmsRequest smsRequest, SendSmsRequestResult smsRequestResult)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entity = _bulkSmsRequestDetailRepository.Where(a => a.BulkSmsRequestDetailId == smsRequest.BulkSmsRequestDetailId).FirstOrDefault();

                    var bulkSmsRequestHeader = _bulkSmsRequestHeaderRepository.Where(a => a.BulkSmsRequestHeaderId == entity.BulkSmsRequestHeaderId).FirstOrDefault();

                    entity.SmsStatus = smsRequestResult.IsSuccess ? SmsStatusEnum.Sent : SmsStatusEnum.Failed;
                    entity.SmsSendResponse = smsRequestResult.IsSuccess ? "SMS Sent Successfully" : smsRequestResult.ProcessDescription;
                    entity.SmsProcessedDate = DateTimeHelper.SaNow;

                    if (!smsRequestResult.IsSuccess)
                    {
                        bulkSmsRequestHeader.WhenToSend = DateTimeHelper.SaNow.AddDays(1);
                        _bulkSmsRequestHeaderRepository.Update(bulkSmsRequestHeader);
                    }

                    entity.SendAttemptCount++;
                    _bulkSmsRequestDetailRepository.Update(entity);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"UpdateBulkSmsRequestDetail > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
        }

        public async Task<int> AddSmsStatusAuditDetail(SmsAuditDetail smsAuditDetail)
        {
            if (smsAuditDetail == null) return -1;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var smsAudit = _smsAuditRepository.FirstOrDefault(x => string.Equals(x.SmsReference, smsAuditDetail.SmsReference));
                smsAuditDetail.SmsAuditId = smsAudit?.Id;
                smsAuditDetail.ModifiedBy = RmaIdentity.Username;
                smsAuditDetail.ModifiedDate = DateTimeHelper.SaNow;
                smsAuditDetail.CreatedBy = RmaIdentity.Username;
                smsAuditDetail.CreatedDate = DateTimeHelper.SaNow;
                var entity = _mapper.Map<campaign_SmsAuditDetail>(smsAuditDetail);
                _campaignSmsAuditDetailRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.SmsAuditDetailId;
            }
        }
    }
}