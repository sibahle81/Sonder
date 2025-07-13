using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Member
{
    public class LetterOfGoodStandingFacade : RemotingStatelessService, ILetterOfGoodStandingService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IRepository<client_LetterOfGoodStanding> _letterOfGoodStandingRepository;
        private readonly IMemberCommunicationService _memberCommunicationService;
        private readonly IPolicyService _policyService;
        private readonly IRepository<client_IndustryClassDeclarationConfiguration> _industryClassDeclarationConfigurationRepository;
        private readonly IRepository<client_RolePlayerPolicyTransaction> _rolePlayerPolicyTransactionRepository;

        public LetterOfGoodStandingFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRolePlayerService rolePlayerService,
            IRepository<client_LetterOfGoodStanding> letterOfGoodStandingRepository,
            IMemberCommunicationService memberCommunicationService,
            IPolicyService policyService,
            IRepository<client_IndustryClassDeclarationConfiguration> industryClassDeclarationConfigurationRepository,
            IRepository<client_RolePlayerPolicyTransaction> rolePlayerPolicyTransactionRepository) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _rolePlayerService = rolePlayerService;
            _letterOfGoodStandingRepository = letterOfGoodStandingRepository;
            _memberCommunicationService = memberCommunicationService;
            _policyService = policyService;
            _industryClassDeclarationConfigurationRepository = industryClassDeclarationConfigurationRepository;
            _rolePlayerPolicyTransactionRepository = rolePlayerPolicyTransactionRepository;
        }

        public async Task<LetterOfGoodStanding> GetLetterOfGoodStanding(int letterOfGoodStandingId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _letterOfGoodStandingRepository.FirstOrDefaultAsync(s => s.LetterOfGoodStandingId == letterOfGoodStandingId);
                return Mapper.Map<LetterOfGoodStanding>(result);
            }
        }

        public async Task<bool> GenerateLetterOfGoodStanding(DateTime expiryDate, int rolePlayerId, int policyId)
        {
            var letterOfGoodStanding = new LetterOfGoodStanding
            {
                IssueDate = DateTimeHelper.SaNow,
                ExpiryDate = expiryDate,
                RolePlayerId = rolePlayerId,
                CertificateNo = await GenerateCertificateNumber(rolePlayerId),
                PolicyId = policyId
            };

            var letter = await CreateLetterOfGoodStanding(letterOfGoodStanding);
            letter.PolicyId = policyId;

            _ = Task.Run(() => EmailLetterOfGoodStanding(letter));

            return true;
        }

        public async Task<bool> GenerateLetterOfGoodStandingForDates(DateTime startDate, DateTime expiryDate, int rolePlayerId, int policyId)
        {
            if (policyId > 0)
            {
                var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(policyId);

                if (policy.ProductCategoryType == ProductCategoryTypeEnum.Coid)
                {
                    var letterOfGoodStanding = new LetterOfGoodStanding
                    {
                        IssueDate = startDate,
                        ExpiryDate = expiryDate,
                        RolePlayerId = rolePlayerId,
                        CertificateNo = await GenerateCertificateNumber(rolePlayerId),
                        PolicyId = policyId
                    };

                    var letter = await CreateLetterOfGoodStanding(letterOfGoodStanding);
                    letter.PolicyId = policyId;

                    await EmailLetterOfGoodStanding(letter);
                }

                return true;
            }
                return false;
        }

        public async Task<PagedRequestResult<LetterOfGoodStanding>> GetPagedLetterOfGoodStanding(PagedRequest request)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayerId = Convert.ToInt32(request.SearchCriteria);
                var letterOfGoodStandings = await _letterOfGoodStandingRepository.Where(l => l.RolePlayerId == rolePlayerId).ToPagedResult<client_LetterOfGoodStanding, LetterOfGoodStanding>(request);

                var rolePlayer = await _rolePlayerService.GetRolePlayer(rolePlayerId);
                foreach (var item in letterOfGoodStandings.Data)
                {
                    item.MemberEmail = rolePlayer.EmailAddress;
                    item.MemberName = rolePlayer.DisplayName;
                }

                return new PagedRequestResult<LetterOfGoodStanding>()
                {
                    Page = request.Page,
                    PageCount = request.PageSize,
                    RowCount = letterOfGoodStandings.RowCount,
                    PageSize = request.PageSize,
                    Data = letterOfGoodStandings.Data
                };
            }
        }

        public async Task<int> EmailLetterOfGoodStanding(LetterOfGoodStanding letterOfGoodStanding)
        {
            Contract.Requires(letterOfGoodStanding != null);

            var rolePlayer = await _rolePlayerService.GetRolePlayer(letterOfGoodStanding.RolePlayerId);
            var coverPeriodStartDate = await GetDefaultRenewalPeriodStartDate(rolePlayer.Company.IndustryClass.Value, DateTimeHelper.SaNow);

            var policy = await _policyService.GetPolicy(letterOfGoodStanding.PolicyId);

            if (rolePlayer.RolePlayerContacts != null && rolePlayer.RolePlayerContacts.Count > 0)
            {
                var primaryContact = rolePlayer.RolePlayerContacts.Find(s => s.Title == TitleEnum.Memb && s.ContactDesignationType == ContactDesignationTypeEnum.PrimaryContact);
                letterOfGoodStanding.MemberEmail = primaryContact != null && !string.IsNullOrEmpty(primaryContact.EmailAddress) ? primaryContact.EmailAddress : rolePlayer.EmailAddress;
            }
            else
            {
                letterOfGoodStanding.MemberEmail = rolePlayer.EmailAddress;
            }

            letterOfGoodStanding.PolicyId = policy.PolicyId;
            return await _memberCommunicationService.SendMemberLogsEmail(letterOfGoodStanding, coverPeriodStartDate.Year, policy.ProductOptionId, true);
        }

        public async Task<int> ResendLetterOfGoodStanding(Contracts.Entities.Policy.Policy policy)
        {
            Contract.Requires(policy != null);

            var rolePlayer = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
            var coverPeriodStartDate = await GetDefaultRenewalPeriodStartDate(rolePlayer.Company.IndustryClass.Value, DateTimeHelper.SaNow);

            var letterOfGoodStanding = new LetterOfGoodStanding
            {
                MemberEmail = rolePlayer.EmailAddress,
                RolePlayerId = rolePlayer.RolePlayerId,
                PolicyId = policy.PolicyId
            };
            return await _memberCommunicationService.SendMemberLogsEmail(letterOfGoodStanding, coverPeriodStartDate.Year, policy.ProductOptionId, false);
        }

        public async Task ExpireLettersOfGoodStanding(int rolePlayerId, DateTime effectiveDate)
        {
            if (rolePlayerId > 0 && effectiveDate != default)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var lettersOfGoodStanding = await _letterOfGoodStandingRepository.Where(s => s.RolePlayerId == rolePlayerId && s.ExpiryDate >= effectiveDate).ToListAsync();
                    if (lettersOfGoodStanding?.Count > 0)
                    {
                        foreach (var letterOfGoodStanding in lettersOfGoodStanding)
                        {
                            letterOfGoodStanding.ExpiryDate = effectiveDate;
                        }
                    }

                    _letterOfGoodStandingRepository.Update(lettersOfGoodStanding);
                    await scope.SaveChangesAsync();
                }
            }
        }

        public async Task<bool> ValidateLetterOfGoodStanding(string certificateNo)
        {
            var isValid = false;
            if (!string.IsNullOrWhiteSpace(certificateNo))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var letterOfGoodStanding = await _letterOfGoodStandingRepository.FirstOrDefaultAsync(s => s.CertificateNo == certificateNo);
                    if (letterOfGoodStanding != null)
                    {
                        isValid = letterOfGoodStanding.ExpiryDate > DateTimeHelper.SaNow;
                    }
                }
            }
            return isValid;
        }

        private async Task<string> GenerateCertificateNumber(int rolePlayerId)
        {
            string result=string.Empty;
            if (rolePlayerId > 0)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(rolePlayerId);
                    var finPayeeNumber = rolePlayer.FinPayee.FinPayeNumber;
                    var coverPeriodStartDate = await GetDefaultRenewalPeriodStartDate(rolePlayer.Company.IndustryClass.Value, DateTimeHelper.SaNow);

                    var startDate = coverPeriodStartDate;
                    var endDate = new DateTime(coverPeriodStartDate.Year + 1, coverPeriodStartDate.Month, coverPeriodStartDate.Day);

                    var lettersOfGoodStandingForCoverPeriod = await _letterOfGoodStandingRepository.Where(l => l.RolePlayerId == rolePlayerId && l.IssueDate >= startDate && l.IssueDate <= endDate).ToListAsync();
                    var letterCount = lettersOfGoodStandingForCoverPeriod?.Count > 0 ? lettersOfGoodStandingForCoverPeriod?.Count + 1 : 1;

                    result= coverPeriodStartDate.Year + finPayeeNumber + letterCount;
                }
            }
            return result;
        }

        private async Task<LetterOfGoodStanding> CreateLetterOfGoodStanding(LetterOfGoodStanding letterOfGoodStanding)
        {
            Contract.Requires(letterOfGoodStanding != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_LetterOfGoodStanding>(letterOfGoodStanding);
                _letterOfGoodStandingRepository.Create(entity);
                await scope.SaveChangesAsync();
                return Mapper.Map<LetterOfGoodStanding>(entity);
            }
        }

        public async Task GenerateNextLetterOfGoodStanding(string invoiceNumber)
        {
            if (!string.IsNullOrWhiteSpace(invoiceNumber))
            {
                var nextRolePlayerPolicyTransaction = await GetNextRolePlayerPolicyTransaction(invoiceNumber);

                var policy = await _policyService.GetPolicyWithProductOptionByPolicyId(nextRolePlayerPolicyTransaction.PolicyId);

                if (policy.ProductCategoryType == ProductCategoryTypeEnum.Coid)
                {
                    if (nextRolePlayerPolicyTransaction.DocumentNumber == invoiceNumber)
                    {
                        var startDate = await GetDefaultRenewalPeriodStartDate(policy.PolicyOwner.Company.IndustryClass.Value, nextRolePlayerPolicyTransaction.EffectiveDate);
                        var expiryDate = policy.ExpiryDate.Value;
                        await GenerateLetterOfGoodStandingForDates(startDate, expiryDate, nextRolePlayerPolicyTransaction.RolePlayerId, nextRolePlayerPolicyTransaction.PolicyId);
                    }
                    else
                    {
                        var expiryDate = nextRolePlayerPolicyTransaction.EffectiveDate;
                        await GenerateLetterOfGoodStanding(expiryDate, nextRolePlayerPolicyTransaction.RolePlayerId, nextRolePlayerPolicyTransaction.PolicyId);
                    }
                }
            }
        }

        private async Task<DateTime> GetDefaultRenewalPeriodStartDate(IndustryClassEnum industryClass, DateTime date)
        {
            var industryClassDeclarationConfiguration = await GetIndustryClassDeclarationConfiguration(industryClass);
            var year = date.Year;

            if (industryClassDeclarationConfiguration == null)
            {
                return new DateTime(year, 1, 1);
            }

            year = date.Month < industryClassDeclarationConfiguration.RenewalPeriodStartMonth || date.Month == industryClassDeclarationConfiguration.RenewalPeriodStartMonth && date.Day < industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth ? date.Year - 1 : date.Year;
            return new DateTime(year, industryClassDeclarationConfiguration.RenewalPeriodStartMonth, industryClassDeclarationConfiguration.RenewalPeriodStartDayOfMonth);
        }

        private async Task<IndustryClassDeclarationConfiguration> GetIndustryClassDeclarationConfiguration(IndustryClassEnum? industryClass)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _industryClassDeclarationConfigurationRepository.FirstOrDefaultAsync(s => s.IndustryClass == industryClass);
                if (entity == null) return null;
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.MaxAverageEarnings);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.DeclarationPenaltyPercentages);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.LiveInAllowances);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.InflationPercentages);
                await _industryClassDeclarationConfigurationRepository.LoadAsync(entity, s => s.MinimumAllowablePremiums);
                return Mapper.Map<IndustryClassDeclarationConfiguration>(entity);
            }
        }

        private async Task<RolePlayerPolicyTransaction> GetNextRolePlayerPolicyTransaction(string documentNumber)
        {
            RolePlayerPolicyTransaction result= null;  
            if (!string.IsNullOrEmpty(documentNumber))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var rolePlayerPolicyTransaction = _rolePlayerPolicyTransactionRepository.First(s => s.DocumentNumber == documentNumber);

                    var rolePlayerPolicyTransactions = await GetRolePlayerPolicyTransactionsForRolePlayerPolicy(rolePlayerPolicyTransaction.RolePlayerId, rolePlayerPolicyTransaction.PolicyId);
                    rolePlayerPolicyTransactions.RemoveAll(s => s.TransactionType == TransactionTypeEnum.CreditNote);
                    var orderedRolePlayerPolicyTransactions = rolePlayerPolicyTransactions.OrderBy(s => s.EffectiveDate);

                    var index = rolePlayerPolicyTransactions.FindIndex(s => s.RolePlayerPolicyTransactionId == rolePlayerPolicyTransaction.RolePlayerPolicyTransactionId);
                    result= rolePlayerPolicyTransactions[(index + 1) < rolePlayerPolicyTransactions.Count ? index + 1 : index];
                }
            }
            return result;
        }

        private async Task<List<RolePlayerPolicyTransaction>> GetRolePlayerPolicyTransactionsForRolePlayerPolicy(int rolePlayerId, int policyId)
        {
            List<RolePlayerPolicyTransaction> result = null;
            if (rolePlayerId > 0 && policyId > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _rolePlayerPolicyTransactionRepository.Where(s => s.RolePlayerId == rolePlayerId && s.PolicyId == policyId && !s.IsDeleted).ToListAsync();
                    await _rolePlayerPolicyTransactionRepository.LoadAsync(entities, t => t.RolePlayerPolicyTransactionDetails);
                    result= Mapper.Map<List<RolePlayerPolicyTransaction>>(entities);
                }
            }
            return result;
        }
    }
}

