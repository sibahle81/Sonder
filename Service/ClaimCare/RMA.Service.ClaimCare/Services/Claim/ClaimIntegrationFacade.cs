using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.Integrations.Contracts.Entities.CompCare;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using ClaimRequest = RMA.Service.ClaimCare.Contracts.Entities.ClaimRequest;
using ClaimResponse = RMA.Service.ClaimCare.Contracts.Entities.ClaimResponse;
using PersonEvent = RMA.Service.Integrations.Contracts.Entities.CompCare.PersonEvent;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimIntegrationFacade : RemotingStatelessService, IClaimIntegrationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        private readonly IRepository<claim_Event> _eventRepository;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;

        private readonly IRolePlayerService _rolePlayerService;
        private readonly IIndustryService _industryService;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly ISerializerService _serializer;
        private readonly IWizardService _wizardService;
        private readonly IPolicyInsuredLifeService _policyInsuredLifeService;
        private const int InitiatePensionCaseWizardConfigurationId = 90;
        private const int PenCaseNumberLength = 7;

        public ClaimIntegrationFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_Event> eventRepository
            , IRepository<claim_PersonEvent> personEventRepository
            , IRepository<claim_Claim> claimRepository
            , IRolePlayerService rolePlayerService
            , IIndustryService industryService
            , IDocumentGeneratorService documentGeneratorService
            , ISerializerService serializer
            , IWizardService wizardService
            , IPolicyInsuredLifeService policyInsuredLifeService) :
            base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _eventRepository = eventRepository;
            _personEventRepository = personEventRepository;
            _claimRepository = claimRepository;
            _rolePlayerService = rolePlayerService;
            _industryService = industryService;
            _documentGeneratorService = documentGeneratorService;
            _serializer = serializer;
            _wizardService = wizardService;
            _policyInsuredLifeService = policyInsuredLifeService;
        }


        public async Task<PensionCaseNotificationResponse> GeneratePensionCaseNotification(Contracts.Entities.Claim claim)
        {
            Contract.Requires(claim != null);

            var pensionCaseNotificationResponse = new PensionCaseNotificationResponse() { IsOperationSuccessFull = false };

            try
            {
                var pensionCaseNotification = new PensionCaseNotificationModel();

                using (_dbContextScopeFactory.Create())
                {
                    var claimEntity = _claimRepository.FirstOrDefault(c =>
                        c.ClaimReferenceNumber == claim.ClaimReferenceNumber && c.DisabilityPercentage > 0M);
                    await _claimRepository.LoadAsync(claimEntity, r => r.PersonEvent);

                    if (claimEntity == null)
                    {
                        pensionCaseNotificationResponse.IsOperationSuccessFull = false;
                        pensionCaseNotificationResponse.ResponseMessage = $"Could not find claim matching ClaimReferenceNumber: {claim.ClaimReferenceNumber}";
                        return await Task.FromResult(pensionCaseNotificationResponse);
                    }

                    if (claimEntity.DisabilityPercentage <= 30)
                    {
                        pensionCaseNotificationResponse.IsOperationSuccessFull = false;
                        pensionCaseNotificationResponse.ResponseMessage = "Disability percentage is less than 30";
                        return await Task.FromResult(pensionCaseNotificationResponse);
                    }

                    var pensionCase =
                        await GetPensionCaseData(claimEntity, pensionCaseNotificationResponse.PensionCaseNumber);

                    //TO DO: Get proper prefix rules
                    var prefix = claimEntity.DisabilityPercentage == 100 ? "F" : "D";

                    if (claimEntity.PersonEvent.CompanyRolePlayerId != null)
                    {
                        var employer =
                            await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.CompanyRolePlayerId.Value);
                        if (employer.FinPayee?.IndustryId > 0)
                        {
                            var result = await _industryService.GetIndustry(employer.FinPayee.IndustryId);
                            pensionCase.IndustryNumber = GetIndustryNumberByIndustryClass(result.IndustryClass);
                            prefix = GetPensionCasePrefixByByIndustryClass(result.IndustryClass, prefix);
                        }
                    }

                    var docNo =
                        await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.PensionCaseNumber,
                            "");

                    pensionCase.PensionCaseNumber = $"{prefix}{docNo.PadLeft(PenCaseNumberLength - prefix.Length, '0')}";
                    pensionCaseNotificationResponse.PensionCaseNumber = pensionCase.PensionCaseNumber;

                    pensionCaseNotification = new PensionCaseNotificationModel
                    {
                        PensionCase = pensionCase,
                        Pensioner = await GetPensionerData(claimEntity),
                        Recipients = await GetPensionCaseRecipients(claimEntity),
                        Beneficiaries = await GetPensionCaseBeneficiaries(claimEntity),
                        BankingDetails = await GetRecipientsBankAccounts(claimEntity),
                    };
                }

                if (string.IsNullOrEmpty(pensionCaseNotificationResponse.PensionCaseNumber))
                {
                    pensionCaseNotificationResponse.IsOperationSuccessFull = false;
                    pensionCaseNotificationResponse.ResponseMessage = "Could not generate Pension Case Number";
                    return await Task.FromResult(pensionCaseNotificationResponse);
                }

                var wizardId = await _wizardService.AddWizard(CreatePensionCaseWizard(pensionCaseNotification));
                if (wizardId == 0)
                {
                    pensionCaseNotificationResponse.IsOperationSuccessFull = false;
                    pensionCaseNotificationResponse.ResponseMessage =
                        $"Could not create pension case wizard for {pensionCaseNotificationResponse.PensionCaseNumber}";
                    return await Task.FromResult(pensionCaseNotificationResponse);
                }

                pensionCaseNotificationResponse.WizardId = wizardId;
                pensionCaseNotificationResponse.IsOperationSuccessFull = true;
                pensionCaseNotificationResponse.ResponseMessage = "Pension Case Notification Generated Successfully";
            }
            catch (Exception e)
            {
                pensionCaseNotificationResponse.IsOperationSuccessFull = false;
                pensionCaseNotificationResponse.ResponseMessage = e.Message;
                e.LogException();
            }

            return await Task.FromResult(pensionCaseNotificationResponse);
        }


        private Wizard CreatePensionCaseWizard(PensionCaseNotificationModel pensionCaseNotification)
        {
            var wizard = new Wizard
            {
                Id = 0,
                WizardConfigurationId = InitiatePensionCaseWizardConfigurationId,
                WizardStatusId = 1,
                LinkedItemId = -1,
                Name = $"{pensionCaseNotification.PensionCase.BenefitType.DisplayAttributeValue()} | {pensionCaseNotification.PensionCase.PensionCaseNumber} | {pensionCaseNotification.PensionCase.PdPercentage}%",
                Data = _serializer.Serialize(new PensionCaseNotificationModel[] { pensionCaseNotification }),
                CurrentStepIndex = 1,
                CustomRoutingRoleId = (int)RoleEnum.PensionServiceAdministrator
            };

            return wizard;
        }

        private async Task<List<PensionCaseRecipientsData>> GetPensionCaseRecipients(claim_Claim claimEntity)
        {
            Contract.Requires(claimEntity != null);

            var beneficiaries = new List<PensionCaseRecipientsData>();

            //TODO : Confirm
            if (claimEntity.DisabilityPercentage < 100) //Assuming that PD less than 100 is a disability claim [Confirm]
            {
                var rolePlayer = await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.InsuredLifeId);

                beneficiaries.Add(
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
                        IdNumber = rolePlayer.Person.IdNumber,
                        IdType = rolePlayer.Person.IdType,
                        DateOfDeath = rolePlayer.Person.DateOfDeath,

                        Contact = rolePlayer.RolePlayerContacts.Any() ? rolePlayer.RolePlayerContacts[0] : null
                    }); ;
            }
            else
            {
                // TODO : Get all recipients from claims
            }

            return await Task.FromResult(beneficiaries);
        }

        private async Task<List<PensionCaseBeneficiariesData>> GetPensionCaseBeneficiaries(claim_Claim claimEntity)
        {
            Contract.Requires(claimEntity != null);

            var beneficiaries = new List<PensionCaseBeneficiariesData>();

            //TODO : Confirm
            if (claimEntity.DisabilityPercentage < 100) //Assuming that PD less than 100 is a disability claim [Confirm]
            {
                var rolePlayer = await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.InsuredLifeId);

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
                        IdNumber = rolePlayer.Person.IdNumber,
                        IdType = rolePlayer.Person.IdType,
                        DateOfDeath = rolePlayer.Person.DateOfDeath,

                        Contact = rolePlayer.RolePlayerContacts.Any() ? rolePlayer.RolePlayerContacts[0] : null
                    });
            }
            else
            {
                // TODO : Get all beneficiaries from claims
            }

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
                IdNumber = rolePlayer.Person.IdNumber,
                IdType = rolePlayer.Person.IdType,
                DateOfDeath = rolePlayer.Person.DateOfDeath,

                Contact = rolePlayer.RolePlayerContacts.Any() ? rolePlayer.RolePlayerContacts[0] : null

            };

            return await Task.FromResult(pensioner);
        }

        private async Task<PensionCaseData> GetPensionCaseData(claim_Claim claimEntity, string pensionCaseNumber)
        {
            Contract.Requires(claimEntity != null);

            string industryNumber = string.Empty;


            var rolePlayer = await _rolePlayerService.GetRolePlayer(claimEntity.PersonEvent.InsuredLifeId);

            if (rolePlayer?.FinPayee != null)
            {
                var result = await _industryService.GetIndustry(rolePlayer.FinPayee.IndustryId);
                if (result != null)
                {
                    industryNumber = GetIndustryNumberByIndustryClass(result.IndustryClass);
                }
            }

            var insuredLife = await _policyInsuredLifeService.GetPolicyInsuredForPolicyOwner(claimEntity.PolicyId.Value, claimEntity.PersonEvent.InsuredLifeId);

            var pensionCaseData = new PensionCaseData()
            {
                BenefitType = claimEntity.DisabilityPercentage == 100 ? BenefitTypeEnum.Fatal : BenefitTypeEnum.Disability,
                PensionCaseNumber = pensionCaseNumber,
                ClaimReferenceNumber = claimEntity.ClaimReferenceNumber,
                ClaimId = claimEntity.ClaimId,
                DateOfAccident = claimEntity.CreatedDate,
                Earnings = insuredLife != null ? insuredLife.Earnings.Value : 0,
                PdPercentage = claimEntity.DisabilityPercentage,
                IndustryNumber = industryNumber
            };
            return await Task.FromResult(pensionCaseData);
        }

        public async Task<ClaimResponse> GetClaim(ClaimRequest claimRequest)
        {
            var claimResponse = new ClaimResponse() { IsOperationSuccessFull = false, ResponseMessage = "Not found" };

            try
            {
                // from claim repositry join policy, join insurer on claimnumber,policynumber and clientCode

                if (claimRequest == null) return claimResponse;
                claimResponse.IsOperationSuccessFull = true;
                claimResponse.ClaimNumber = claimRequest.ClaimNumber;
                claimResponse.PolicyNumber = claimRequest.PolicyNumber;
                claimResponse.ClaimStatus = ClaimStatusEnum.Approved.DisplayAttributeValue();
            }
            catch (Exception ex)
            {
                claimResponse.IsOperationSuccessFull = false;
                claimResponse.ResponseMessage = ex.Message;//TO DO: Return a Generic Message
                ex.LogException();
            }

            return await Task.FromResult(claimResponse);
        }

        public async Task<ClaimResponse> GetClaimByClaimId(int claimId)
        {
            var claimResponse = new ClaimResponse
            {
                IsOperationSuccessFull = false,
                ResponseMessage = "Not found"
            };

            try
            {
                // from claim repositry join policy, join insurer on claimnumber,policynumber and clientCode
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var claim = _claimRepository.FirstOrDefault(c => c.ClaimId == claimId);

                    claimResponse.IsOperationSuccessFull = true;
                    claimResponse.ClaimNumber = claim.ClaimReferenceNumber;
                    claimResponse.PolicyId = claim.PolicyId.Value;
                    claimResponse.ClaimStatus = ClaimStatusEnum.Approved.DisplayAttributeValue();
                    claimResponse.ResponseMessage = "Success";
                    claimResponse.AssignedToUserId = claim.AssignedToUserId.Value;
                }
            }
            catch (Exception ex)
            {
                claimResponse.IsOperationSuccessFull = false;
                claimResponse.ResponseMessage = ex.Message;//TO DO: Return a Generic Message
                ex.LogException();
            }

            return await Task.FromResult(claimResponse);
        }

        public async Task<RootCCClaimResponse> PostClaimRequest(RootCCClaimRequest claimRequest)
        {
            if (claimRequest == null) return null;

            var rootCcClaimResponse = new RootCCClaimResponse()
            {
                response = new CCClaimResponse()
                {
                    claimReferenceNo = claimRequest.request.claimReferenceNo,
                    sourceSystemReference = claimRequest.request.sourceSystemReference,
                    personEvents = new List<PersonEvent>().ToArray()
                }
            };

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await (
                               from pe in _personEventRepository
                               join evt in _eventRepository on pe.EventId equals evt.EventId
                               where pe.PersonEventReferenceNumber == claimRequest.request.claimReferenceNo
                               select new PersonEvent
                               {
                                   personEventID = pe.PersonEventId,
                                   fileRefNumber = pe.PersonEventReferenceNumber,
                                   employeeRolePlayerId = pe.InsuredLifeId,
                                   employerRolePlayerId = pe.CompanyRolePlayerId.Value,
                                   eventCategoryID = (int)evt.EventType,
                                   occupation = "", //TODO: Need to first add capturing on front end
                                   eventDate = evt.EventDate,
                                   isValid = true,
                               }).Distinct().ToListAsync();

                rootCcClaimResponse.response.personEvents = personEvent.ToArray();
            }


            var employee = await _rolePlayerService.GetRolePlayer(rootCcClaimResponse.response.personEvents[0].employeeRolePlayerId);
            if (employee?.Person != null)
            {
                rootCcClaimResponse.response.personEvents[0].firstName = employee.Person.FirstName;
                rootCcClaimResponse.response.personEvents[0].lastName = employee.Person.Surname;
                rootCcClaimResponse.response.personEvents[0].dateOfBirth = employee.Person.DateOfBirth;
                rootCcClaimResponse.response.personEvents[0].idNumber = employee.Person.IdType == Admin.MasterDataManager.Contracts.Enums.IdTypeEnum.SAIDDocument ? employee.Person.IdNumber : employee.Person.PassportNumber;
                rootCcClaimResponse.response.personEvents[0].gender = employee.Person.Gender?.DisplayAttributeValue();
            }

            var employer = await _rolePlayerService.GetRolePlayer(rootCcClaimResponse.response.personEvents[0].employerRolePlayerId);

            if (employer?.FinPayee != null)
            {
                var result = await _industryService.GetIndustry(employer.FinPayee.IndustryId);
                if (result != null)
                {
                    rootCcClaimResponse.response.personEvents[0].industryNumber = GetIndustryNumberByIndustryClass(result.IndustryClass);
                }
                rootCcClaimResponse.response.personEvents[0].employerName = employer.DisplayName;
            }
            return rootCcClaimResponse;
        }

        private static string GetIndustryNumberByIndustryClass(IndustryClassEnum industryClass)
        {
            switch (industryClass)
            {
                case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Metals:
                    return ClaimConstants.MetalsClass;
                case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Mining:
                    return ClaimConstants.MiningClass;
                case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Individual:
                case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Group:
                case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Senna:
                    return ClaimConstants.IndividualGroupSennaClass;
                default:
                    return ClaimConstants.OtherClass;
            }
        }

        private static string GetPensionCasePrefixByByIndustryClass(IndustryClassEnum industryClass, string prefix)
        {
            switch (industryClass)
            {
                case Admin.MasterDataManager.Contracts.Enums.IndustryClassEnum.Metals:
                    return $"{prefix}X";
                default:
                    return $"{prefix}"; ;
            }
        }
    }
}


