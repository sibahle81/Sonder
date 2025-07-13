using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;
using Roleplayer = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyCaseFacade : RemotingStatelessService, IPolicyCaseService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_RolePlayerRelation> _rolePlayerRelationRepository;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<product_Benefit> _productBenefitRepository;
        private readonly IRepository<policy_PolicyInsuredLife> _insuredLifeRepository;
        private readonly IRepository<policy_Insurer> _insurerRepository;
        private readonly IProductService _productService;
        private readonly IAuditWriter _auditWriter;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly IIndustryService _industryService;
        private readonly IRepository<client_PreviousInsurerRolePlayer> _previousInsurerRolePlayerRepository;
        private readonly IRepository<policy_PolicyLifeExtension> _policyLifeExtensionRepository;
        private readonly IRepository<policy_PolicyContact> _policyContactRepository;
        private readonly IRepository<policy_PolicyDocumentCommunicationMatrix> _policyDocumentCommunicationMatrixRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<client_RolePlayerBankingDetail> _bankingDetailRepository;
        private readonly IRepository<client_RolePlayerAddress> _rolePlayerAddressRepository;
        private readonly IRepository<policy_PolicyInsuredLifeAdditionalBenefit> _additionalBenefitsRepository;

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public PolicyCaseFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<policy_Policy> policyRepository,
            IRepository<client_RolePlayerRelation> rolePlayerRelationRepository,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<product_Benefit> productBenefitRepository,
            IRepository<policy_PolicyInsuredLife> insuredLifeRepository,
            IRepository<policy_Insurer> insurerRepository,
            IProductService productService,
            IAuditWriter auditWriter,
            IRepository<client_FinPayee> finPayeeRepository,
            IIndustryService industryService,
            IRepository<client_PreviousInsurerRolePlayer> previousInsurerRolePlayerRepository,
            IRepository<policy_PolicyLifeExtension> policyLifeExtensionRepository,
            IRepository<policy_PolicyContact> policyContactRepository,
            IRepository<policy_PolicyDocumentCommunicationMatrix> policyDocumentCommunicationMatrixRepository,
            IConfigurationService configurationService,
            IRepository<client_Person> personRepository,
            IRepository<client_RolePlayerBankingDetail> bankingDetailRepository,
            IRepository<client_RolePlayerAddress> rolePlayerAddressRepository,
            IRepository<policy_PolicyInsuredLifeAdditionalBenefit> additionalBenefitsRepository
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _rolePlayerRelationRepository = rolePlayerRelationRepository;
            _rolePlayerRepository = rolePlayerRepository;
            _auditWriter = auditWriter;
            _productBenefitRepository = productBenefitRepository;
            _productService = productService;
            _finPayeeRepository = finPayeeRepository;
            _industryService = industryService;
            _insuredLifeRepository = insuredLifeRepository;
            _insurerRepository = insurerRepository;
            _previousInsurerRolePlayerRepository = previousInsurerRolePlayerRepository;
            _policyLifeExtensionRepository = policyLifeExtensionRepository;
            _policyContactRepository = policyContactRepository;
            _policyDocumentCommunicationMatrixRepository = policyDocumentCommunicationMatrixRepository;
            _configurationService = configurationService;
            _personRepository = personRepository;
            _bankingDetailRepository = bankingDetailRepository;
            _rolePlayerAddressRepository = rolePlayerAddressRepository;
            _additionalBenefitsRepository = additionalBenefitsRepository;
        }

        public async Task<Case> GetCaseByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            var policy = new policy_Policy();
            PolicyModel policyModel;

            using (var scope = _dbContextScopeFactory.Create())
            {
                await _auditWriter.AddLastViewed<policy_Policy>(policyId);

                policy = await _policyRepository.SingleAsync(
                      p => p.PolicyId == policyId,
                      $"Could not find policy with PolicyId {policyId}");

                await LoadReferenceData(policy);

                policyModel = Mapper.Map<PolicyModel>(policy);

                var policyLifeExtension = _policyLifeExtensionRepository.SingleOrDefault(x => x.PolicyId == policy.PolicyId);

                if (policyLifeExtension != null)
                {
                    policyModel.PolicyLifeExtension = Mapper.Map<PolicyLifeExtension>(policyLifeExtension);
                }
                else
                {
                    policyModel.PolicyLifeExtension = null;
                }

                var person = _personRepository.SingleOrDefault(p => p.RolePlayerId == policyModel.PolicyOwnerId);
                policyModel.PolicyOwner.Person = Mapper.Map<Person>(person);

                // Following method requires Product on policy.ProductOption
                policyModel.ProductOption.Product = await _productService.GetProduct(policyModel.ProductOption.ProductId);

                var isBenefitsFeatureFlagEnabled = await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BenefitsFeatureFlag);

                if (!isBenefitsFeatureFlagEnabled && policy.PolicyBrokers.Count > 0) // The whole if statement must be removed, Get should not save!!!!
                {
                    var policyBrokers = (List<policy_PolicyBroker>)policy.PolicyBrokers;

                    policy.RepresentativeId = policyBrokers
                        .Where(r => r.EffectiveDate <= DateTimeHelper.SaNow)
                        .OrderByDescending(r => r.EffectiveDate)
                        .Select(r => r.RepId)
                        .FirstOrDefault();

                    policy.JuristicRepresentativeId = policyBrokers
                        .Where(r => r.EffectiveDate <= DateTimeHelper.SaNow)
                        .OrderByDescending(r => r.EffectiveDate)
                        .Select(r => r.JuristicRepId)
                        .FirstOrDefault();

                    policy.BrokerageId = policyBrokers
                        .Where(r => r.EffectiveDate <= DateTimeHelper.SaNow)
                        .OrderByDescending(r => r.EffectiveDate)
                        .Select(r => r.BrokerageId)
                        .FirstOrDefault();
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            return await CreateCaseModel(policy);
        }

        private async Task<Case> CreateCaseModel(policy_Policy policy)
        {
            Contract.Requires(policy != null);
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var policyBroker = policy.PolicyBrokers
                    .Where(r => r.EffectiveDate <= DateTimeHelper.SaNow)
                    .OrderByDescending(r => r.EffectiveDate)
                    .FirstOrDefault();

                var brokerage = policyBroker?.Brokerage;
                var brokerageId = policyBroker?.BrokerageId;

                var representative = policyBroker?.Rep;
                var representativeId = policyBroker?.RepId;

                var juristicRepresentative = policyBroker?.JuristicRep;
                var juristicRepresentativeId = policyBroker?.JuristicRepId;

                var caseModel = new Case
                {
                    Code = policy.PolicyNumber,
                    BrokerageId = brokerageId == null ? 0 : (int)brokerageId,
                    Brokerage = brokerage == null ? null : Mapper.Map<Brokerage>(brokerage),
                    RepresentativeId = representativeId == null ? 0 : (int)representativeId,
                    Representative = representative == null ? null : Mapper.Map<Representative>(representative),
                    JuristicRepresentativeId = juristicRepresentativeId,
                    JuristicRepresentative = juristicRepresentative == null ? null : Mapper.Map<Representative>(juristicRepresentative),
                };

                if (policy.ProductOption != null)
                {
                    caseModel.ProductId = policy.ProductOption.ProductId;
                }

                var rolePlayer = await _rolePlayerRepository.FindByIdAsync(policy.PolicyOwner.RolePlayerId);
                await _rolePlayerRepository.LoadAsync(rolePlayer, r => r.Company);
                await _rolePlayerRepository.LoadAsync(rolePlayer, r => r.Person);
                await _rolePlayerRepository.LoadAsync(rolePlayer, r => r.RolePlayerBankingDetails);
                await _rolePlayerRepository.LoadAsync(rolePlayer, r => r.PreviousInsurerRolePlayers);

                caseModel.MainMember = Mapper.Map<Roleplayer>(rolePlayer);
                caseModel.CaseTypeId = (int)CaseTypeEnum.IndividualNewBusiness;

                if (caseModel.MainMember.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Company)
                {
                    caseModel.CaseTypeId = (int)CaseTypeEnum.GroupNewBusiness;
                    caseModel.MainMember.Company.CompanyName = rolePlayer.Company.Name;
                    caseModel.MainMember.Company.ContactMobile = caseModel.MainMember.CellNumber;
                    caseModel.MainMember.Company.ContactEmail = caseModel.MainMember.EmailAddress;
                    caseModel.MainMember.Company.ContactTelephone = caseModel.MainMember.TellNumber;
                    caseModel.MainMember.Company.CompanyRegNo = rolePlayer.Company.ReferenceNumber;
                    caseModel.MainMember.Company.VatRegistrationNo = rolePlayer.Company.VatRegistrationNo;
                    if (caseModel.MainMember.Person != null)
                    {
                        caseModel.MainMember.Company.ContactPersonName = caseModel.MainMember.Person.FirstName;
                        caseModel.MainMember.Company.ContactDesignation = caseModel.MainMember.Person.IdNumber;
                    }

                    var finPayee = await _finPayeeRepository.FindByIdAsync(caseModel.MainMember.Company.RolePlayerId);

                    var industryId = Convert.ToInt32(finPayee.IndustryId);
                    if (industryId > 0)
                    {
                        var industry = await _industryService.GetIndustry(industryId);
                        caseModel.MainMember.Company.IndustryClass = industry.IndustryClass;
                    }
                }

                caseModel.MainMember.Policies = new List<RolePlayerPolicy> { Mapper.Map<RolePlayerPolicy>(policy) };
                if (caseModel.MainMember.Policies.Count > 0)
                {
                    if (caseModel.MainMember.Policies[0].InsuredLives == null)
                    {
                        caseModel.MainMember.Policies[0].InsuredLives = new List<PolicyInsuredLife>();
                    }
                }
                var policyLifeExtension = await _policyLifeExtensionRepository.SingleOrDefaultAsync(x => x.PolicyId == policy.PolicyId);

                if (policyLifeExtension != null)
                {
                    caseModel.MainMember.Policies[0].PolicyLifeExtension = new PolicyLifeExtension
                    {
                        PolicyId = policy.PolicyId,
                        AffordabilityCheckFailReason = policyLifeExtension.AffordabilityCheckFailReason,
                        AffordabilityCheckPassed = policyLifeExtension.AffordabilityCheckPassed,
                        AnnualIncreaseMonth = policyLifeExtension.AnnualIncreaseMonth,
                        AnnualIncreaseType = policyLifeExtension.AnnualIncreaseType,
                        CreatedBy = policyLifeExtension.CreatedBy,
                        CreatedDate = policyLifeExtension.CreatedDate,
                        IsDeleted = policyLifeExtension.IsDeleted,
                        IsEuropAssistExtended = policyLifeExtension.IsEuropAssistExtended,
                        ModifiedBy = policyLifeExtension.ModifiedBy,
                        ModifiedDate = policyLifeExtension.ModifiedDate,
                        PolicyLifeExtensionId = policyLifeExtension.PolicyLifeExtensionId,
                    };

                }
                else
                {
                    caseModel.MainMember.Policies[0].PolicyLifeExtension = null;
                }

                if (policy.ParentPolicyId.HasValue)
                {
                    var insuredLives = await _insuredLifeRepository
                        .Where(s => s.PolicyId == policy.PolicyId)
                        .ToListAsync();
                    var benefitIds = insuredLives
                        .Select(s => s.StatedBenefitId)
                        .ToList();
                    if (benefitIds?.Count > 0)
                    {
                        policy.Benefits = policy.Benefits
                            .Where(s => benefitIds.Contains(s.Id))
                            .ToList();
                    }
                    // Add insured lives to policy
                    foreach (var life in insuredLives)
                    {
                        caseModel.MainMember.Policies[0].InsuredLives.Add(
                            new PolicyInsuredLife
                            {
                                PolicyId = life.PolicyId,
                                RolePlayerId = life.RolePlayerId,
                                RolePlayerTypeId = life.RolePlayerTypeId,
                                InsuredLifeStatus = life.InsuredLifeStatus,
                                StatedBenefitId = life.StatedBenefitId,
                                StartDate = life.StartDate
                            }
                        );
                    }

                    // Get some policy details from the parent
                    var parentPolicyEntity =
                        await _policyRepository.SingleAsync(p => p.PolicyId == policy.ParentPolicyId);
                    var parentPolicyOwner = await _rolePlayerRepository.FindByIdAsync(parentPolicyEntity.PolicyOwnerId);
                    await _rolePlayerRepository.LoadAsync(parentPolicyOwner, r => r.RolePlayerBankingDetails);
                    caseModel.MainMember.RolePlayerBankingDetails = Mapper.Map<List<RolePlayerBankingDetail>>(parentPolicyOwner.RolePlayerBankingDetails);
                    //Business needs scheme details on child contact details component - new additions.
                    caseModel.MainMember.Company = new Company()
                    {
                        CompanyIdType = CompanyIdTypeEnum.RegistrationNo,
                        Name = parentPolicyOwner.DisplayName,
                        ContactPersonName = parentPolicyOwner.DisplayName,
                        ContactTelephone = parentPolicyOwner.TellNumber,
                        ContactEmail = parentPolicyOwner.EmailAddress,
                        ContactMobile = parentPolicyOwner.CellNumber
                    };
                    caseModel.CaseTypeId = (int)CaseTypeEnum.GroupNewBusiness;
                    caseModel.MainMember.Policies[0].ParentPolicyInceptionDate = parentPolicyEntity.PolicyInceptionDate;
                }

                caseModel.MainMember.Benefits = await GetMainMemberBenefit(policy.PolicyId, policy.ProductOption.Name, caseModel.MainMember);
                caseModel.MainMember.RolePlayerBankingDetails = await GetMainMemberBankingDetails(caseModel.MainMember.RolePlayerId);
                caseModel.MainMember.RolePlayerAddresses = await GetMainMemberAddresses(caseModel.MainMember.RolePlayerId);

                var spouses = await GetInsuredLives(policy.PolicyId, policy.ProductOption.Name, RolePlayerTypeEnum.Spouse);
                var children = await GetInsuredLives(policy.PolicyId, policy.ProductOption.Name, RolePlayerTypeEnum.Child);
                var extendedMembers = await GetInsuredLives(policy.PolicyId, policy.ProductOption.Name, RolePlayerTypeEnum.Extended);

                caseModel.Beneficiaries = await GetPolicyBeneficiaries(policy.PolicyId);

                foreach (var spouse in spouses)
                {
                    spouse.Person.IsBeneficiary = CheckIfBeneficiary(spouse.RolePlayerId, caseModel.Beneficiaries);
                    var _previousInsurerRolePlayers = await _previousInsurerRolePlayerRepository.Where(s => s.RolePlayerId == spouse.RolePlayerId).ToListAsync();
                    spouse.PreviousInsurerRolePlayers = new List<PreviousInsurerRolePlayer>();
                    spouse.PreviousInsurerRolePlayers = Mapper.Map<List<PreviousInsurerRolePlayer>>(_previousInsurerRolePlayers);
                }

                foreach (var child in children)
                {
                    child.Person.IsBeneficiary = CheckIfBeneficiary(child.RolePlayerId, caseModel.Beneficiaries);
                    var _previousInsurerRolePlayers = await _previousInsurerRolePlayerRepository.Where(s => s.RolePlayerId == child.RolePlayerId).ToListAsync();
                    child.PreviousInsurerRolePlayers = new List<PreviousInsurerRolePlayer>();
                    child.PreviousInsurerRolePlayers = Mapper.Map<List<PreviousInsurerRolePlayer>>(_previousInsurerRolePlayers);
                }

                foreach (var extended in extendedMembers)
                {
                    extended.Person.IsBeneficiary = CheckIfBeneficiary(extended.RolePlayerId, caseModel.Beneficiaries);
                    var _previousInsurerRolePlayers = await _previousInsurerRolePlayerRepository.Where(s => s.RolePlayerId == extended.RolePlayerId).ToListAsync();
                    extended.PreviousInsurerRolePlayers = new List<PreviousInsurerRolePlayer>();
                    extended.PreviousInsurerRolePlayers = Mapper.Map<List<PreviousInsurerRolePlayer>>(_previousInsurerRolePlayers);
                }

                caseModel.Spouse = new List<Roleplayer>(spouses);
                caseModel.Children = new List<Roleplayer>(children);
                caseModel.ExtendedFamily = new List<Roleplayer>(extendedMembers);

                caseModel.MainMember.Policies[0].ProductOption.Product
                    = await _productService.GetProduct(caseModel.ProductId);

                var insurerId = caseModel.MainMember.Policies[0].InsurerId;
                if (insurerId > 0)
                {
                    var insurer = await _insurerRepository.SingleOrDefaultAsync(i => i.Id == insurerId);
                    if (insurer != null)
                        caseModel.MainMember.Policies[0].Insurer = insurer.Name;
                }

                if (policy.ParentPolicyId.HasValue)
                {
                    var _policyContact = await _policyContactRepository.FirstOrDefaultAsync(s => s.PolicyId == policy.ParentPolicyId && s.ContactType == ContactTypeEnum.BrokerContact);
                    caseModel.MainMember.Policies[0].BrokerPolicyContact = _policyContact != null ? Mapper.Map<PolicyContact>(_policyContact) : new PolicyContact() { PolicyContactId = 0, ContactType = ContactTypeEnum.BrokerContact };
                }
                else
                {
                    var policyContact = await _policyContactRepository.FirstOrDefaultAsync(s => s.PolicyId == policy.PolicyId && s.ContactType == ContactTypeEnum.BrokerContact);
                    caseModel.MainMember.Policies[0].BrokerPolicyContact = policyContact != null ? Mapper.Map<PolicyContact>(policyContact) : new PolicyContact() { PolicyContactId = 0, ContactType = ContactTypeEnum.BrokerContact };
                }

                var _policyDocumentCommunicationMatrix = await _policyDocumentCommunicationMatrixRepository.FirstOrDefaultAsync(s => s.PolicyId == policy.PolicyId);
                caseModel.MainMember.Policies[0].PolicyDocumentCommunicationMatrix = _policyDocumentCommunicationMatrix != null ? Mapper.Map<PolicyDocumentCommunicationMatrix>(_policyDocumentCommunicationMatrix) : new PolicyDocumentCommunicationMatrix() { PolicyDocumentCommunicationMatrixId = 0 };

                var adminPolicyContact = policy.PolicyContacts?.FirstOrDefault(s => s.PolicyId == policy.PolicyId && s.ContactType == ContactTypeEnum.Administrator);
                caseModel.MainMember.Policies[0].AdminPolicyContact = adminPolicyContact != null ? Mapper.Map<PolicyContact>(adminPolicyContact) : new PolicyContact() { PolicyContactId = 0, ContactType = ContactTypeEnum.Administrator };

                var firstAlternativePolicyContact = policy.PolicyContacts?.FirstOrDefault(s => s.PolicyId == policy.PolicyId && s.ContactType == ContactTypeEnum.FirstAlternativePolicyContact);
                caseModel.MainMember.Policies[0].FirstAlternativePolicyContact = firstAlternativePolicyContact != null ? Mapper.Map<PolicyContact>(firstAlternativePolicyContact) : new PolicyContact() { PolicyContactId = 0, ContactType = ContactTypeEnum.FirstAlternativePolicyContact };

                var secondAlternativePolicyContact = policy.PolicyContacts?.FirstOrDefault(s => s.PolicyId == policy.PolicyId && s.ContactType == ContactTypeEnum.SecondAlternativePolicyContact);
                caseModel.MainMember.Policies[0].SecondAlternativePolicyContact = secondAlternativePolicyContact != null ? Mapper.Map<PolicyContact>(secondAlternativePolicyContact) : new PolicyContact() { PolicyContactId = 0, ContactType = ContactTypeEnum.SecondAlternativePolicyContact };

                return caseModel;
            }
        }

        private bool CheckIfBeneficiary(int rolePlayerId, List<Roleplayer> beneficiaries)
        {
            var beneficiary = beneficiaries.FirstOrDefault(b => b.RolePlayerId == rolePlayerId);
            return beneficiary != null;
        }

        private async Task<List<RolePlayerAddress>> GetMainMemberAddresses(int rolePlayerId)
        {
            var list = new List<RolePlayerAddress>();
            if (rolePlayerId > 0)
            {
                var data = await _rolePlayerAddressRepository
                    .Where(s => s.RolePlayerId == rolePlayerId)
                    .OrderByDescending(s => s.CreatedDate)
                    .ToListAsync();
                var physical = data.Find(s => s.AddressType == AddressTypeEnum.Physical);
                if (physical != null) list.Add(Mapper.Map<RolePlayerAddress>(physical));
                var postal = data.Find(s => s.AddressType == AddressTypeEnum.Postal);
                if (postal != null) list.Add(Mapper.Map<RolePlayerAddress>(postal));
            }
            return list;
        }

        private async Task<List<RolePlayerBankingDetail>> GetMainMemberBankingDetails(int rolePlayerId)
        {
            var list = new List<RolePlayerBankingDetail>();
            if (rolePlayerId > 0)
            {
                var data = await _bankingDetailRepository
                .Where(s => s.RolePlayerId == rolePlayerId)
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();
                var payment = data.Find(s => s.PurposeId == (int)BankingPurposeEnum.Payments);
                if (payment != null) list.Add(Mapper.Map<RolePlayerBankingDetail>(payment));
                var collection = data.Find(s => s.PurposeId == (int)BankingPurposeEnum.Collections);
                if (collection != null) list.Add(Mapper.Map<RolePlayerBankingDetail>(collection));
            }
            return list;
        }

        private async Task<List<RolePlayerBenefit>> GetMainMemberBenefit(int policyId, string productOption, Roleplayer mainMember)
        {
            List<RolePlayerBenefit> benefits = new List<RolePlayerBenefit>();
            if (policyId > 0 && !string.IsNullOrEmpty(productOption) && mainMember != null)
            {
                var insuredLife = await _insuredLifeRepository
                    .SingleOrDefaultAsync(s => s.PolicyId == policyId
                                            && s.RolePlayerId == mainMember.RolePlayerId);
                if (insuredLife != null)
                {
                    benefits = await GetPolicyMemberBenefits(policyId, productOption, mainMember, insuredLife);
                }
            }
            return benefits;
        }

        private async Task<RolePlayerBenefit> LoadRolePlayerBenefit(product_Benefit productBenefit, string productOption, string memberName, decimal? premium, decimal? coverAmount)
        {
            Contract.Requires(productBenefit != null);
            await _productBenefitRepository.LoadAsync(productBenefit, c => c.BenefitRates);

            var benefit = Mapper.Map<Benefit>(productBenefit);
            var roleplayerBenefit = Mapper.Map<RolePlayerBenefit>(benefit);

            var benefitRateLatest = benefit.BenefitRates
                .OrderByDescending(r => r.EffectiveDate)
                .Select(r => r.BenefitAmount)
                .FirstOrDefault();
            var benefitBaseRateLatest = benefit.BenefitRates
                .OrderByDescending(r => r.EffectiveDate)
                .Select(r => r.BaseRate)
                .FirstOrDefault();

            premium = premium ?? 0.00M;
            coverAmount = coverAmount ?? 0.00M;
            var useBenefitRate = premium + coverAmount == 0.00M;

            roleplayerBenefit.RolePlayerName = memberName;
            roleplayerBenefit.ProductOptionName = productOption;
            roleplayerBenefit.BenefitName = productBenefit.Name;
            roleplayerBenefit.BenefitBaseRateLatest = useBenefitRate ? benefitBaseRateLatest : premium.Value;
            roleplayerBenefit.BenefitRateLatest = useBenefitRate ? benefitRateLatest : coverAmount.Value;
            roleplayerBenefit.BenefitRates = null;
            roleplayerBenefit.Selected = true;
            return roleplayerBenefit;
        }

        private async Task<List<Roleplayer>> GetPolicyBeneficiaries(int policyId)
        {
            List<Roleplayer> beneficiaries = null;
            if (policyId > 0)
            {
                // Get the beneficiaries for the policy
                var relations = await _rolePlayerRelationRepository
                    .Where(s => s.PolicyId == policyId && s.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary)
                    .ToListAsync();
                await _rolePlayerRelationRepository.LoadAsync(relations, s => s.RolePlayerRelationLife);
                // Return a blank list if there are none
                if (relations.Count == 0) { return new List<Roleplayer>(); }
                // Get the rolePlayerId's
                var rolePlayerIds = relations.Select(s => s.FromRolePlayerId).ToList<int>();
                // Load the roleplayers, because that is what we have to return
                var rolePlayers = await _rolePlayerRepository
                    .Where(s => rolePlayerIds.Contains(s.RolePlayerId))
                    .ToListAsync();
                // Load the person details
                await _rolePlayerRepository.LoadAsync(rolePlayers, s => s.Person);
                // Map the beneficiaries
                beneficiaries = Mapper.Map<List<Roleplayer>>(rolePlayers);
                // Remove relations that are not specifically beneficiaries
                foreach (var beneficiary in beneficiaries)
                {
                    beneficiary.FromRolePlayers = beneficiary.FromRolePlayers
                        .Where(s => s.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary)
                        .ToList();
                }
            }
            return beneficiaries;
        }

        public async Task<decimal> GetTotalCoverAmount(IdTypeEnum idTypeId, string idNumber, int excludePolicyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var idTypeIdParameter = new SqlParameter { ParameterName = "@idTypeId", Value = (int)idTypeId };
                var idNumberParameter = new SqlParameter { ParameterName = "@idNumber", Value = idNumber };
                var policyIdParameter = new SqlParameter { ParameterName = "@policyId", Value = excludePolicyId };

                var summary = await _policyRepository
                    .SqlQueryAsync<TotalCoverAmount>(
                        "[policy].[GetTotalCoverAmount] @idTypeId, @idNumber, @policyId",
                        idTypeIdParameter,
                        idNumberParameter,
                        policyIdParameter);
                return summary[0].Amount;
            }
        }

        private async Task<List<Roleplayer>> GetInsuredLives(int policyId, string productOption, RolePlayerTypeEnum rolePlayerType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);
            var rolePlayerList = new List<Roleplayer>();
            if (policyId > 0 && !string.IsNullOrEmpty(productOption))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    
                    var policyInsuredLives = await LoadPolicyInsuredLives(policyId, rolePlayerType);
                    if (policyInsuredLives.Count > 0)
                    {
                        var rolePlayers = await LoadRolePlayers(policyInsuredLives);
                        foreach (var rolePlayer in rolePlayers)
                        {
                            var insuredLife = policyInsuredLives.SingleOrDefault(s => s.RolePlayerId == rolePlayer.RolePlayerId);
                            rolePlayer.Benefits = await GetPolicyMemberBenefits(policyId, productOption, rolePlayer, insuredLife);
                            rolePlayer.FromRolePlayers = await GetRolePlayerRelations(policyId, rolePlayer.RolePlayerId);
                            rolePlayer.JoinDate = insuredLife.StartDate;
                            rolePlayerList.Add(rolePlayer);
                        }
                    }
                   
                }
            }
            return rolePlayerList;
        }

        private async Task<List<RolePlayerRelation>> GetRolePlayerRelations(int policyId, int rolePlayerId)
        {
            List<RolePlayerRelation> rolePlayerRelations = new List<RolePlayerRelation>();
            if (rolePlayerId > 0 && policyId>0)
            {
                var relations = await _rolePlayerRelationRepository
                    .Where(s => s.PolicyId == policyId
                             && s.FromRolePlayerId == rolePlayerId
                             && s.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary)
                    .ToListAsync();
                rolePlayerRelations= Mapper.Map<List<RolePlayerRelation>>(relations);
            }
            return rolePlayerRelations;
        }

        private async Task<List<RolePlayerBenefit>> GetPolicyMemberBenefits(int policyId, string productOption, Roleplayer rolePlayer, policy_PolicyInsuredLife insuredLife)
        {
            Contract.Requires(insuredLife!= null);
            Contract.Requires(rolePlayer != null);

            var benefits = new List<RolePlayerBenefit>();

            var productBenefit = await _productBenefitRepository
                .SingleOrDefaultAsync(c => c.Id == insuredLife.StatedBenefitId);
            var basicBenefit = await LoadRolePlayerBenefit(
                productBenefit,
                productOption,
                rolePlayer.DisplayName,
                insuredLife.Premium ?? 0.00M,
                insuredLife.CoverAmount ?? 0.00M);
            benefits.Add(basicBenefit);

            var additionalBenefits = await _additionalBenefitsRepository
                .Where(s => s.PolicyId == policyId
                         && s.RolePlayerId == rolePlayer.RolePlayerId)
                .ToListAsync();
            foreach (var benefit in additionalBenefits)
            {
                // Only load additional benefits for the main member, or if the premium or cover amount are populated
                if (insuredLife.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf || benefit.Premium > 0.00M || benefit.CoverAmount > 0.00M)
                {
                    productBenefit = await _productBenefitRepository
                        .SingleOrDefaultAsync(c => c.Id == benefit.BenefitId);
                    var additionalBenefit = await LoadRolePlayerBenefit(
                        productBenefit,
                        productOption,
                        rolePlayer.DisplayName,
                        benefit.Premium ?? 0.00M,
                        benefit.CoverAmount ?? 0.00M);
                    benefits.Add(additionalBenefit);
                }
            }
            return benefits;
        }

        private async Task<List<Roleplayer>> LoadRolePlayers(List<policy_PolicyInsuredLife> insuredLives)
        {
            Contract.Requires(insuredLives != null);
            var rolePlayerIds = insuredLives.Select(s => s.RolePlayerId).ToList<int>();
            var rolePlayerList = await _rolePlayerRepository
                .Where(s => rolePlayerIds.Contains(s.RolePlayerId))
                .ToListAsync();
            await _rolePlayerRepository.LoadAsync(rolePlayerList, s => s.Person);
            return Mapper.Map<List<Roleplayer>>(rolePlayerList);
        }

        private async Task<List<policy_PolicyInsuredLife>> LoadPolicyInsuredLives(int policyId, RolePlayerTypeEnum rolePlayerType)
        {
            var data = new List<policy_PolicyInsuredLife>();
            if (policyId > 0)
            {
                if (rolePlayerType == RolePlayerTypeEnum.Extended)
                {
                    var excludeRolePlayerTypes = new List<int>
                    {
                        (int)RolePlayerTypeEnum.MainMemberSelf,
                        (int)RolePlayerTypeEnum.Spouse,
                        (int)RolePlayerTypeEnum.Child
                    };
                    data = await _insuredLifeRepository
                        .Where(s => s.PolicyId == policyId
                                 && s.InsuredLifeStatus == InsuredLifeStatusEnum.Active
                                 && !excludeRolePlayerTypes.Contains(s.RolePlayerTypeId))
                        .ToListAsync();
                }
                else
                {
                    data = await _insuredLifeRepository
                        .Where(s => s.PolicyId == policyId
                                 && s.InsuredLifeStatus == InsuredLifeStatusEnum.Active
                                 && s.RolePlayerTypeId == (int)rolePlayerType)
                        .ToListAsync();
                }
            }
            return data;
        }

        private async Task LoadReferenceData(policy_Policy entity)
        {
            Contract.Requires(entity != null);
            var isBenefitsFeatureFlagEnabled = await _configurationService.IsFeatureFlagSettingEnabled(SystemSettings.BenefitsFeatureFlag);

            using (var scope = _dbContextScopeFactory.CreateReadOnly(DbContextScopeOption.JoinExisting))
            {
                await _policyRepository.LoadAsync(entity, r => r.ProductOption);
                await _policyRepository.LoadAsync(entity, r => r.PolicyOwner);
                await _policyRepository.LoadAsync(entity, r => r.Representative);
                await _policyRepository.LoadAsync(entity, r => r.Brokerage);
                await _policyRepository.LoadAsync(entity, r => r.JuristicRepresentative);

                if (!isBenefitsFeatureFlagEnabled)
                {
                    await _policyRepository.LoadAsync(entity, r => r.Benefits);
                }

                await _policyRepository.LoadAsync(entity, r => r.PolicyBrokers);
                await _policyRepository.LoadAsync(entity, r => r.PolicyNotes);
                await _policyRepository.LoadAsync(entity, r => r.Insurer);
                await _policyRepository.LoadAsync(entity, r => r.PolicyContacts);
            }

            if (isBenefitsFeatureFlagEnabled)
            {
                await LoadBenefits(entity);
            }
        }

        /// <summary>
        /// The benefits keeps on breaking the system on prod, the system starts to hang
        /// This method is optimized to read benefits from the database in a batch of 25
        /// https://randmutual.visualstudio.com/Modernisation/_workitems/edit/35928
        /// </summary>
        /// <param name="policy"></param>
        /// <returns></returns>
        private async Task LoadBenefits(policy_Policy policy)
        {
            if (policy == null)
            {
                throw new NullReferenceException("Policy cannot be null for loading the Benefits");
            }

            var skip = 0;
            var size = 0;
            var defaultSize = (await _configurationService.GetModuleSetting(SystemSettings.MaxDbRecords)).ToInt();

            if (defaultSize.HasValue)
            {
                size = defaultSize.Value;
            }

            if (size == 0)
            {
                size = 25; // Default value will be 25 records per batch;
            }

            var resultSize = 0;
            var benefits = new List<product_Benefit>();

            do
            {
                resultSize = 0;

                using (var scope = _dbContextScopeFactory.CreateReadOnly(DbContextScopeOption.JoinExisting))
                {
                    var results = await _productBenefitRepository
                                        .Where(benefit => benefit.Policies.Any(p => p.PolicyId == policy.PolicyId))
                                        .OrderBy(b => b.CreatedDate)
                                        .Skip(skip)
                                        .Take(size)
                                        .ToListAsync();

                    benefits.AddRange(results);
                    resultSize = results.Count;
                    skip += size;
                }

            } while (resultSize >= size);

            policy.Benefits = benefits;
        }

        public async Task<Case> GetCaseForPolicyScheduleByPolicyId(int policyId)
        {
            var policy = new policy_Policy();

            using (var scope = _dbContextScopeFactory.Create())
            {
                policy = await _policyRepository.SingleAsync(
                      p => p.PolicyId == policyId,
                      $"Could not find policy with PolicyId {policyId}");

                await LoadPolicyScheduleReferenceData(policy);

                var policyModel = Mapper.Map<PolicyModel>(policy);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return await CreateCaseModel(policy);
        }

        private async Task LoadPolicyScheduleReferenceData(policy_Policy entity)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly(DbContextScopeOption.JoinExisting))
            {
                await _policyRepository.LoadAsync(entity, r => r.ProductOption);
                await _policyRepository.LoadAsync(entity, r => r.PolicyOwner);
                await _policyRepository.LoadAsync(entity, r => r.Representative);
                await _policyRepository.LoadAsync(entity, r => r.Brokerage);
                await _policyRepository.LoadAsync(entity, r => r.JuristicRepresentative);
            }
        }
    }
}
