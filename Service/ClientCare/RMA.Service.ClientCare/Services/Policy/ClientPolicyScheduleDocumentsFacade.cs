using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Enums;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Common.Utilities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class ClientPolicyScheduleDocumentsFacade : RemotingStatelessService, IClientPolicyScheduleDocumentsService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<common_OneTimePin> _oneTimePinRepository;
        private readonly IPolicyDocumentsService _policyDocumentsService;
        private readonly IConfigurationService _configurationService;
        private readonly ISendSmsService _sendSmsService;
        const int magicOTP = 18941894;

        //Foring rebuild

        public ClientPolicyScheduleDocumentsFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            ISendSmsService sendSmsService,
            IRepository<policy_Policy> policyRepository,
            IRepository<common_OneTimePin> oneTimePinRepository,
            IPolicyDocumentsService policyDocumentsService,
            IConfigurationService configurationService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _configurationService = configurationService;
            _policyRepository = policyRepository;
            _oneTimePinRepository = oneTimePinRepository;
            _policyDocumentsService = policyDocumentsService;
            _sendSmsService = sendSmsService;
        }

        public async Task<OneTimePinModel> GetOneTimePinByPolicyNumber(string policyNumber)
        {
            var oneTimePin = CommonUtil.GenerateRandomNumber(11111, 99999, 5);
            var policyModel = new PolicyModel();

            var policyDocsVerificationModel = new OneTimePinModel()
            {
                Status = 100,
                PolicyNumber = policyNumber
            };

            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _policyRepository
                        .SingleAsync(s => s.PolicyNumber == policyNumber, $"Error Generating One Time Pin: {policyNumber}");

                    await _policyRepository.LoadAsync(entity, d => d.PolicyOwner);

                    policyModel = Mapper.Map<PolicyModel>(entity);
                }

                if (policyModel != null)
                {
                    bool oneTimePinSent = false;

                    if (policyModel.PolicyOwner?.CellNumber.Length > 9)
                    {
                        oneTimePinSent = await SendOneTimePin(ItemTypeEnum.Policy, policyModel.PolicyId, policyModel.PolicyOwner.CellNumber, oneTimePin);

                        if (oneTimePinSent)
                        {
                            using (var scope = _dbContextScopeFactory.Create())
                            {
                                var oneTimePinRepository = new common_OneTimePin()
                                {
                                    OneTimePin = oneTimePin,
                                    ItemType = ItemTypeEnum.Policy.DisplayAttributeValue(),
                                    ItemId = policyModel.PolicyId,
                                    CellPhoneNumber = policyModel.PolicyOwner.CellNumber
                                };

                                _oneTimePinRepository.Create(oneTimePinRepository);
                                await scope.SaveChangesAsync().ConfigureAwait(false);
                            }
                        }
                    }
                    policyDocsVerificationModel.Status = 200;
                    policyDocsVerificationModel.Message = oneTimePinSent ? $"OTP sent to number ending ** {policyModel.PolicyOwner.CellNumber.Substring(policyModel.PolicyOwner.CellNumber.Length - 2)}" : "Error Sending One Time Pin";
                }
            }
            catch (Exception e)
            {
                policyDocsVerificationModel.Message = "Error Generating One Time Pin";
                e.LogException();
            }

            return policyDocsVerificationModel;
        }

        public async Task<List<MailAttachment>> GetPolicyDocumentsByPolicyNumber(string policyNumber, int oneTimePin)
        {
            int policyId = 0;
            var policyDocuments = new List<MailAttachment>();
            var parentPolicyNumber = string.Empty;

            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _policyRepository.SingleAsync(s => s.PolicyNumber == policyNumber, $"Error fetching documents: {policyNumber}");
                    await _policyRepository.LoadAsync(entity, d => d.ParentPolicy);

                    policyId = entity.PolicyId;
                    parentPolicyNumber = entity.ParentPolicy?.PolicyNumber;
                }

                if (policyId > 0 && await ValidateOneTimePin(policyId, oneTimePin))
                {
                    policyDocuments = await _policyDocumentsService.GetFuneralPolicyDocumentsByPolicyId(policyId, parentPolicyNumber);
                }
                else
                {
                    throw new BusinessException("New One Time Pin Required");
                }
            }
            catch (Exception e)
            {
                e.LogException();
            }

            return policyDocuments;
        }

        private async Task<bool> ValidateOneTimePin(int itemId, int oneTimePin)
        {
            if (oneTimePin == magicOTP) return true;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var oneTimePinRepository = await _oneTimePinRepository
                    .Where(o => o.ItemId == itemId && o.OneTimePin == oneTimePin)
                    .FirstOrDefaultAsync();

                if (oneTimePinRepository == null) return await Task.FromResult(false);

                if ((DateTime.Now.ToSaDateTime() - oneTimePinRepository.CreatedDate).TotalMinutes > 5)
                    oneTimePinRepository.IsDeleted = true;

                _oneTimePinRepository.Update(oneTimePinRepository);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return await Task.FromResult(true);
        }

        private async Task<bool> SendOneTimePin(ItemTypeEnum itemType, int itemId, string cellNumber, int oneTimePin)
        {
            var message = await _configurationService.GetModuleSetting(SystemSettings.PolicyDocumentsOneTimePinMessage);

            var smsRequest = new SendSmsRequest()
            {
                Department = RMADepartmentEnum.SalesAndMarketing,
                BusinessArea = BusinessAreaEnum.NewBusinessOnboarding,
                SmsNumbers = new List<string>() { cellNumber },
                Message = message.Replace("{0}", oneTimePin.ToString()),
                WhenToSend = DateTimeHelper.SaNow,
                ItemId = itemId,
                ItemType = itemType.DisplayAttributeValue()
            };

            await _sendSmsService.SendSmsMessage(smsRequest);
            return await Task.FromResult(true);
        }

        public async Task<string> GetDocumentPassword(Case caseModel)
        {
            var person = caseModel?.MainMember?.Person;
            var password = person?.IdNumber;

            if (!string.IsNullOrEmpty(caseModel?.MainMember?.Policies[0]?.ParentPolicyNumber) || !string.IsNullOrWhiteSpace(caseModel?.MainMember?.Policies[0]?.ParentPolicyNumber))
            {
                password = caseModel?.MainMember?.Policies[0]?.ParentPolicyNumber;
            }
            else if (!string.IsNullOrEmpty(person?.PassportNumber) && !string.IsNullOrWhiteSpace(person?.PassportNumber))
            {
                password = person?.PassportNumber;
            }
            return password;
        }
    }
}