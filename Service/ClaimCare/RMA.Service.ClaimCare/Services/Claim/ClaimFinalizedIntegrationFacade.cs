using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.PensCare.Contracts.Entities.PensionLedger;
using RMA.Service.PensCare.Contracts.Interfaces.PensionCase;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimFinalizedIntegrationFacade : RemotingStatelessService, IClaimFinalizedIntegrationService
    {
        private readonly ISerializerService _serializer;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IIndustryService _industryService;
        private readonly IPolicyInsuredLifeService _policyInsuredLifeService;
        private readonly IInsuredLifeService _insuredLifeService;
        private readonly IPensionCaseService _pensionCaseService;
        private readonly IRepository<claim_Event> _eventRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IProductService _productService;
        private readonly IPolicyService _policyService;
        private readonly IProductOptionService _productOptionService;
        private readonly IClaimEarningService _claimEarningService;
        private readonly IClaimInvoiceService _claimInvoiceService;
        private readonly IClaimService _claimService;
        private readonly IBenefitService _benefitService;

        private bool isFatal = false;

        public ClaimFinalizedIntegrationFacade(
              StatelessServiceContext context
            , ISerializerService serializer
            , IServiceBusMessage serviceBusMessage
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_Claim> claimRepository
            , IRolePlayerService rolePlayerService
            , IIndustryService industryService
            , IPensionCaseService pensionCaseService
            , IPolicyInsuredLifeService policyInsuredLifeService
            , IInsuredLifeService insuredLifeService
            , IRepository<claim_Event> eventRepository
            , IRepository<claim_PersonEvent> personEventRepository
            , IProductService productService
            , IPolicyService policyService
            , IProductOptionService productOptionService
            , IClaimEarningService claimEarningService
            , IClaimInvoiceService claimInvoiceService
            , IClaimService claimService
            , IBenefitService benefitService) : base(context)
        {
            _serializer = serializer;
            _serviceBusMessage = serviceBusMessage;
            _dbContextScopeFactory = dbContextScopeFactory;
            _claimRepository = claimRepository;
            _rolePlayerService = rolePlayerService;
            _industryService = industryService;
            _serializer = serializer;
            _policyInsuredLifeService = policyInsuredLifeService;
            _pensionCaseService = pensionCaseService;
            _eventRepository = eventRepository;
            _insuredLifeService = insuredLifeService;
            _personEventRepository = personEventRepository;
            _productService = productService;
            _policyService = policyService;
            _productOptionService = productOptionService;
            _claimEarningService = claimEarningService;
            _claimInvoiceService = claimInvoiceService;
            _claimService = claimService;
            _benefitService = benefitService;
        }

        #region Public Methods
        public async Task<bool> PublishPensionClaims(Contracts.Entities.Claim claim)
        {
            var notification = await GeneratePensionCaseNotification(claim);

            var messageBody = _serializer.Serialize(notification);
            var messageType = new MessageType
            {
                MessageId = Guid.NewGuid().ToString(),
                MessageBody = messageBody,
                From = ClaimConstants.MessageFrom,
                To = ClaimConstants.MessageFrom,
                MessageTaskType = ClaimConstants.MessageTaskType009,
                EnqueuedTime = DateTime.Now
            };

            if (notification.PensionClaims[0].PensionBenefits.Count == 0)
            {
                return false;
            }
            else
            {
                await _pensionCaseService.InitiatePensionCase(messageBody, messageType.MessageId);
                return true;
            }
        }

        public async Task<List<PensionClaimPDRecoveries>> GetPensionClaimPDRecoveries(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var pensionClaimPDRecoveries = await _claimRepository.SqlQueryAsync<PensionClaimPDRecoveries>(DatabaseConstants.GetPensionClaimPDRecoveries, new SqlParameter { ParameterName = "@RolePlayerId", Value = rolePlayerId });

                return await Task.FromResult(pensionClaimPDRecoveries);
            }
        }
        #endregion

        #region Private Methods
        private async Task<ClaimFinalizedPensionCaseNotification> GeneratePensionCaseNotification(Contracts.Entities.Claim claim)
        {
            Contract.Requires(claim != null);
            var pensionCaseNotification = new ClaimFinalizedPensionCaseNotification();

            using (_dbContextScopeFactory.Create())
            {
                var claimEntity = _claimRepository.FirstOrDefault(c =>
                    c.ClaimReferenceNumber == claim.ClaimReferenceNumber);
                await _claimRepository.LoadAsync(claimEntity, r => r.PersonEvent);

                isFatal = (bool)claimEntity.PersonEvent.IsFatal;

                var pensionCase = await GetPensionCaseData(claimEntity);
                var pensionClaims = await GetPensionClaimsData(claimEntity);
                var industryNumber = string.Empty;

                if (claimEntity.PersonEvent.CompanyRolePlayerId != null)
                {
                    var employer =
                        await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.CompanyRolePlayerId.Value);
                    if (employer.FinPayee?.IndustryId > 0)
                    {
                        var result = await _industryService.GetIndustry(employer.FinPayee.IndustryId);
                        pensionCase.IndustryNumber = GetIndustryNumberByIndustryClass(result.IndustryClass);
                        industryNumber = pensionCase.IndustryNumber;
                    }
                }

                pensionCaseNotification = new ClaimFinalizedPensionCaseNotification()
                {
                    PensionCase = pensionCase,
                    Pensioner = await GetPensionerData(claimEntity),
                    Beneficiaries = await GetPensionCaseBeneficiaries(claimEntity),
                    BankingDetails = await GetRecipientsBankAccounts(claimEntity),
                    PensionClaims = pensionClaims
                };

                if (!isFatal)
                {
                    pensionCaseNotification.Recipients = await GetPensionCaseRecipients(claimEntity);
                }

                return pensionCaseNotification;
            }
        }

        private async Task<PensionCaseData> GetPensionCaseData(claim_Claim claimEntity)
        {
            Contract.Requires(claimEntity != null);

            string industryNumber = string.Empty;
            decimal claimEarnings = 0;

            var rolePlayer = await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.InsuredLifeId);

            if (rolePlayer?.FinPayee != null && rolePlayer?.FinPayee.IndustryId > 0)
            {
                var result = await _industryService.GetIndustry(rolePlayer.FinPayee.IndustryId);
                if (result != null)
                {
                    industryNumber = GetIndustryNumberByIndustryClass(result.IndustryClass);
                }
            }
            var earnings = 0M;
            var insuredLife = await _policyInsuredLifeService.GetPolicyInsuredForPolicyOwner(claimEntity.PolicyId.Value, claimEntity.PersonEvent.InsuredLifeId);
            var earningEntity = await _claimEarningService.GetEarningsByPersonEventId(claimEntity.PersonEventId);
            if (earningEntity != null && earningEntity.Count > 0)
            {
                var verifiedEarning = earningEntity.Where(t => t.IsVerified == true && t.EarningsType == EarningsTypeEnum.Accident).SingleOrDefault();
                if (verifiedEarning != null && verifiedEarning.Total != null)
                {
                    earnings = (decimal)verifiedEarning.Total;
                }
            }

            var pensionCaseData = new PensionCaseData()
            {
                BenefitType = isFatal ? BenefitTypeEnum.Fatal : BenefitTypeEnum.Disability,
                PensionCaseNumber = string.Empty,
                ClaimReferenceNumber = claimEntity.ClaimReferenceNumber,
                ClaimId = claimEntity.ClaimId,
                DateOfAccident = claimEntity.CreatedDate,
                Earnings = earnings,
                PdPercentage = claimEntity.DisabilityPercentage,
                IndustryNumber = industryNumber,
                Caa = claimEntity.Caa.Value

            };
            return await Task.FromResult(pensionCaseData);
        }

        private async Task<List<PensionCaseRecipientsData>> GetPensionCaseRecipients(claim_Claim claimEntity)
        {
            Contract.Requires(claimEntity != null);

            var recipients = new List<PensionCaseRecipientsData>();

            var rolePlayer = await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.InsuredLifeId);

            recipients.Add(
                new PensionCaseRecipientsData
                {
                    Title = rolePlayer.Person.Title,
                    FirstName = rolePlayer.Person.FirstName,
                    Surname = rolePlayer.Person.Surname,
                    Age = rolePlayer.Person.Age,
                    DateOfBirth = rolePlayer.Person.DateOfBirth,
                    Gender = rolePlayer.Person.Gender,
                    MaritalStatus = rolePlayer.Person.MaritalStatus,
                    CountryOriginId = rolePlayer.Person.CountryOriginId,
                    IdNumber = rolePlayer.Person.IdNumber != null ? rolePlayer.Person.IdNumber : rolePlayer.Person.PassportNumber,
                    IdType = rolePlayer.Person.IdType,
                    DateOfDeath = rolePlayer.Person.DateOfDeath,
                    BeneficiaryType = BeneficiaryTypeEnum.Pensioner,
                    PassportNumber = rolePlayer.Person.PassportNumber != null ? rolePlayer.Person.PassportNumber : rolePlayer.Person.IdNumber,
                    Contact = rolePlayer.RolePlayerContacts.Any() ? rolePlayer.RolePlayerContacts[0] : null
                });
            return await Task.FromResult(recipients);
        }

        private async Task<List<PensionCaseBeneficiariesData>> GetPensionCaseBeneficiaries(claim_Claim claimEntity)
        {
            Contract.Requires(claimEntity != null);

            var beneficiaries = new List<PensionCaseBeneficiariesData>();

            var request = new PagedRequest { SearchCriteria = claimEntity.PersonEvent.InsuredLifeId.ToString(), OrderBy = "RolePlayerId" };

            var pagedBeneficiaryList = await _rolePlayerService.GetPagedBeneficiaries(request).ConfigureAwait(true);

            foreach (var rolePlayer in pagedBeneficiaryList.Data)
            {
                beneficiaries.Add(
                    new PensionCaseBeneficiariesData
                    {
                        Title = rolePlayer.Person.Title,
                        FirstName = rolePlayer.Person.FirstName,
                        Surname = rolePlayer.Person.Surname,
                        Age = rolePlayer.Person.Age,
                        DateOfBirth = rolePlayer.Person.DateOfBirth,
                        Gender = rolePlayer.Person.Gender,
                        MaritalStatus = rolePlayer.Person.MaritalStatus,
                        CountryOriginId = rolePlayer.Person.CountryOriginId,
                        IdNumber = rolePlayer.Person.IdNumber != null ? rolePlayer.Person.IdNumber : rolePlayer.Person.PassportNumber,
                        IdType = rolePlayer.Person.IdType,
                        DateOfDeath = rolePlayer.Person.DateOfDeath,
                        BeneficiaryType = BeneficiaryTypeEnum.Other,
                        PassportNumber = rolePlayer.Person.PassportNumber != null ? rolePlayer.Person.PassportNumber : rolePlayer.Person.IdNumber,
                        Contact = rolePlayer.RolePlayerContacts.Any(x => x.IsConfirmed.HasValue) ? rolePlayer.RolePlayerContacts.FirstOrDefault(x => x.IsConfirmed.HasValue) : null,
                    });
            }

            if (isFatal)
                beneficiaries = beneficiaries.Where(x => x.RolePlayerId != claimEntity.PersonEvent.InsuredLifeId).ToList();

            return await Task.FromResult(beneficiaries);
        }

        private async Task<List<PensionCaseBankingDetailsData>> GetRecipientsBankAccounts(claim_Claim claimEntity)
        {
            Contract.Requires(claimEntity != null);

            var recipientsBankAccounts = new List<PensionCaseBankingDetailsData>();

            var rolePlayerBankingDetails = await _rolePlayerService.GetBankingDetailsByRolePlayerId(claimEntity.PersonEvent.InsuredLifeId);

            recipientsBankAccounts = rolePlayerBankingDetails.Select(x => new PensionCaseBankingDetailsData
            {
                AccountHolder = x.AccountHolderName,
                AccountHolderName = x.AccountHolderName,
                AccountHolderSurname = x.AccountHolderName,
                AccountNumber = x.AccountNumber,
                AccountType = (int)x.BankAccountType,
                BranchCode = x.BranchCode,
                BankBranchId = x.BankBranchId,
                BankId = x.BankBranchId,
                EffectiveDate = x.EffectiveDate,
                RolePlayerId = x.RolePlayerId
            }).ToList();

            return await Task.FromResult(recipientsBankAccounts);
        }

        private async Task<PensionCasePensionerData> GetPensionerData(claim_Claim claimEntity)
        {
            Contract.Requires(claimEntity != null);

            var rolePlayer =
                await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.InsuredLifeId);

            var designationType = await _rolePlayerService.GetPersonEmploymentByPersonEmploymentId(claimEntity.PersonEvent.PersonEmploymentId.Value);

            var pensioner = new PensionCasePensionerData()
            {
                Title = rolePlayer.Person.Title,
                FirstName = rolePlayer.Person.FirstName,
                Surname = rolePlayer.Person.Surname,
                Age = rolePlayer.Person.Age,
                DateOfBirth = rolePlayer.Person.DateOfBirth,
                Gender = rolePlayer.Person.Gender,
                MaritalStatus = rolePlayer.Person.MaritalStatus,
                CountryOriginId = rolePlayer.Person.CountryOriginId,
                IdNumber = rolePlayer.Person.IdNumber != null ? rolePlayer.Person.IdNumber : rolePlayer.Person.PassportNumber,
                IdType = rolePlayer.Person.IdType,
                DateOfDeath = rolePlayer.Person.DateOfDeath != null ? rolePlayer.Person.DateOfDeath : claimEntity.PersonEvent.PersonEventDeathDetail?.DeathDate,
                BeneficiaryType = BeneficiaryTypeEnum.Pensioner,
                DesignationTypeID = designationType.DesignationTypeId,
                PassportNumber = rolePlayer.Person.PassportNumber != null ? rolePlayer.Person.PassportNumber : rolePlayer.Person.IdNumber,
                Contact = rolePlayer.RolePlayerContacts.Any() ? rolePlayer.RolePlayerContacts[0] : null
            };

            return await Task.FromResult(pensioner);
        }

        private async Task<List<PensionClaimData>> GetPensionClaimsData(claim_Claim claimEntity)
        {
            Contract.Requires(claimEntity != null);
            string industryNumber = string.Empty;
            ProductOption productOption = null;
            Product product = null;

            var rolePlayer = await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.InsuredLifeId);
            var claimData = new List<PensionClaimData>();

            var claims = await _claimService.GetPersonEventClaims(claimEntity.PersonEvent.PersonEventId).ConfigureAwait(false);
            foreach (var claim in claims)
            {
                if (rolePlayer?.FinPayee != null && rolePlayer?.FinPayee.IndustryId > 0)
                {
                    var result = await _industryService.GetIndustry(rolePlayer.FinPayee.IndustryId);
                    if (result != null)
                    {
                        industryNumber = GetIndustryNumberByIndustryClass(result.IndustryClass);
                    }
                }

                if (claimEntity.PolicyId.Value > 0)
                {
                    var policy = await _policyService.GetPolicy(claim.PolicyId.Value);
                    productOption = await _productOptionService.GetProductOption(policy.ProductOptionId);
                    product = await _productService.GetProduct(productOption.ProductId);
                    var productOptionBenefits = await _productOptionService.GetBenefitsForProductOption(policy.ProductOptionId);
                }

                var insuredLife = await _policyService.GetPolicyInsuredLife(claimEntity.PolicyId.Value, rolePlayer.RolePlayerId);
                var personEventDetail = await _personEventRepository.FirstOrDefaultAsync(x => x.PersonEventId == claim.PersonEventId);
                var eventDetail = await _eventRepository.FirstOrDefaultAsync(x => x.EventId == personEventDetail.EventId);
                var claimEstimates = await _claimInvoiceService.GetClaimEstimateByPersonEventId(claim.PersonEventId);
                var currentClaimEstimates = claimEstimates.Where(ce => ce.ClaimId == claim.ClaimId).ToList(); 
                var pensionBenefitList = new List<PensionBenefit>();

                foreach (var claimEstimate in currentClaimEstimates)
                {
                    if (claimEstimate.BenefitId.HasValue)
                    {
                        var benefit = await _benefitService.GetBenefit((int)claimEstimate.BenefitId);
                        var pensionBenefit = new PensionBenefit()
                        {
                            BenefitAmount = claimEstimate.EstimatedValue.Value,
                            BenefitCode = benefit.Code,
                            BenefitId = benefit.Id,
                            BenefitName = benefit.Name,
                            ProductCode = productOption.Code,
                            ProductOption = productOption.Description,
                            ProductClass = product.ProductClass,
                            IsTaxable = productOption.IsTaxabled.HasValue ? (bool)productOption.IsTaxabled.Value : false
                        };
                        pensionBenefitList.Add(pensionBenefit);
                    }
                }

                var estimatedValue = 0M;
                foreach (var item in claim.ClaimBenefits)
                {
                    estimatedValue = item.EstimatedValue;

                }
                var earnings = 0M;
                if (insuredLife != null)
                {
                    earnings = insuredLife.Earnings.Value;
                }

                var earningEntity = await _claimEarningService.GetEarningsByPersonEventId(claim.PersonEventId);
                if (earningEntity != null && earningEntity.Count > 0)
                {
                    var verifiedEarning = earningEntity.Where(t => t.IsVerified == true && t.EarningsType == EarningsTypeEnum.Accident).SingleOrDefault();
                    if (verifiedEarning != null && verifiedEarning.Total != null)
                    {
                        earnings = (decimal)verifiedEarning.Total;
                    }
                }

                var pensionClaim = new PensionClaimData()
                {
                    PersonEventId = claim.PersonEventId,
                    ClaimId = claim.ClaimId,
                    ClaimReferenceNumber = claim.ClaimReferenceNumber,
                    DateOfAccident = eventDetail.EventDate,
                    DateOfStabilisation = (DateTime)(personEventDetail.DateOfStabilisation != null ? personEventDetail.DateOfStabilisation : personEventDetail.ModifiedDate),
                    PolicyId = (int)claim.PolicyId,
                    Member = rolePlayer.Person.FirstName + ' ' + rolePlayer.Person.Surname,
                    Earnings = (double)earnings,
                    ProductCode = productOption?.Code,
                    PensionLumpSum = 0,
                    EstimatedCv = estimatedValue,
                    Icd10Driver = "B310",
                    Drg = "X9",
                    FoodAndQuarters = 0,
                    IncreaseList = null,
                    IndustryNumber = industryNumber,
                    WidowLumpSum = 0,
                    PercentageIncrease = 0,
                    TotalCompensation = 0,
                    VerifiedCV = 0,
                    PensionBenefits = pensionBenefitList,
                };
                claimData.Add(pensionClaim);
            }
            return await Task.FromResult(claimData);
        }
        #endregion

        #region Static Methods
        private static string GetIndustryNumberByIndustryClass(IndustryClassEnum industryClass)
        {
            switch (industryClass)
            {
                case IndustryClassEnum.Metals:
                    return ClaimConstants.MetalsClass;
                case IndustryClassEnum.Mining:
                    return ClaimConstants.MiningClass;
                case IndustryClassEnum.Individual:
                case IndustryClassEnum.Group:
                case IndustryClassEnum.Senna:
                    return ClaimConstants.IndividualGroupSennaClass;
                default:
                    return ClaimConstants.OtherClass;
            }
        } 
        #endregion
    }
}

