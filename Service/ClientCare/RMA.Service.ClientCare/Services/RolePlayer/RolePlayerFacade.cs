using AutoMapper;

using Castle.Core.Internal;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.Integrations.Contracts.Entities.Vopd;
using RMA.Service.Integrations.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using RolePlayerModel = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.RolePlayer;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class RolePlayerFacade : RemotingStatelessService, IRolePlayerService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<client_RolePlayer> _rolePlayerRepository;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_RolePlayerType> _rolePlayerTypeRepository;
        private readonly IRepository<client_RolePlayerRelation> _rolePlayerRelationRepository;
        private readonly IRepository<client_VopdResponse> _vopdResponseRepository;
        private readonly IRepository<client_RolePlayerBankingDetail> _rolePlayerBankingDetailRepository;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly IRepository<client_Company> _companyRepository;
        private readonly IRepository<client_Person> _personRepository;
        private readonly IRepository<client_UserVopdResponse> _userVopdResponseRepository;
        private readonly IRepository<client_PreviousInsurerRolePlayer> _previousInsurerRolePlayerRepository;
        private readonly IRepository<client_RolePlayerContact> _rolePlayerContactRepository;
        private readonly IRepository<client_RolePlayerAddress> _rolePlayerAddressRepository;
        private readonly IRepository<client_FuneralParlor> _funeralParlorRepository;
        private readonly IRepository<client_Undertaker> _undertakerRepository;
        private readonly IRepository<client_BodyCollector> _bodyCollectorRepository;
        private readonly IRepository<client_PersonEmployment> _personEmployment;

        private readonly IAuditWriter _auditWriter;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private readonly IBankBranchService _bankBranchService;
        private readonly IHealthCareProviderService _healthCareProviderService;
        private readonly IIndustryService _industryService;
        private readonly IProductOptionService _productOptionService;
        private readonly IBankAccountService _bankAccountService;
        private readonly IConfigurationService _configurationService;
        private readonly IQuickTransactionVopdService _quickTransactionVopdService;
        private readonly IRolePlayerNoteService _rolePlayerNoteService;
        private readonly IBenefitService _benefitService;

        private const string ClientModulePermissionsFfl = "ClientModulePermissions";
        private const string vopdError = "ID: IDENTITY NUMBER NOT VALID,Status/Error,Unknown,IDENTITY NUMBER NOT VALID";
        private const string IsVopdQuickTransactEnabled = "IsVopdQuickTransactEnabled";
        private const string IsVopdCachedTransactEnabled = "IsVopdCachedTransactEnabled";

        public RolePlayerFacade(
            StatelessServiceContext context,
            IRepository<client_RolePlayer> rolePlayerRepository,
            IRepository<policy_Policy> policyRepository,
            IRepository<client_RolePlayerType> rolePlayerTypeRepository,
            IRepository<client_VopdResponse> vopdResponseRepository,
            IRepository<client_UserVopdResponse> userVopdResponseRepository,
            IRepository<client_RolePlayerRelation> rolePlayerRelationRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            IAuditWriter auditWriter,
            IDocumentGeneratorService documentGeneratorService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IRepository<client_RolePlayerBankingDetail> rolePlayerBankingDetailRepository,
            IRepository<client_FinPayee> finPayeeRepository,
            IRepository<client_Company> companyRepository,
            IBankBranchService bankBranchService,
            IRepository<client_Person> personRepository,
            IIndustryService industryService,
            IProductOptionService productOptionService,
            IBankAccountService bankAccountService,
            IRepository<client_PreviousInsurerRolePlayer> previousInsurerRolePlayerRepository,
            IConfigurationService configurationService,
            IRepository<client_RolePlayerContact> rolePlayerContactRepository,
            IRepository<client_RolePlayerAddress> rolePlayerAddressRepository,
            IRepository<client_FuneralParlor> funeralParlorRepository,
            IRepository<client_Undertaker> undertakerRepository,
            IRepository<client_BodyCollector> bodyCollectorRepository,
            IRepository<client_PersonEmployment> personEmployment,
            IHealthCareProviderService healthCareProviderService,
            IQuickTransactionVopdService quickTransactionVopdService,
            IRolePlayerNoteService rolePlayerNoteService,
            IBenefitService benefitService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _auditWriter = auditWriter;
            _rolePlayerRepository = rolePlayerRepository;
            _rolePlayerTypeRepository = rolePlayerTypeRepository;
            _rolePlayerRelationRepository = rolePlayerRelationRepository;
            _documentGeneratorService = documentGeneratorService;
            _vopdResponseRepository = vopdResponseRepository;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _policyRepository = policyRepository;
            _rolePlayerBankingDetailRepository = rolePlayerBankingDetailRepository;
            _finPayeeRepository = finPayeeRepository;
            _companyRepository = companyRepository;
            _bankBranchService = bankBranchService;
            _personRepository = personRepository;
            _industryService = industryService;
            _productOptionService = productOptionService;
            _bankAccountService = bankAccountService;
            _userVopdResponseRepository = userVopdResponseRepository;
            _previousInsurerRolePlayerRepository = previousInsurerRolePlayerRepository;
            _configurationService = configurationService;
            _rolePlayerContactRepository = rolePlayerContactRepository;
            _funeralParlorRepository = funeralParlorRepository;
            _undertakerRepository = undertakerRepository;
            _bodyCollectorRepository = bodyCollectorRepository;
            _personEmployment = personEmployment;
            _healthCareProviderService = healthCareProviderService;
            _quickTransactionVopdService = quickTransactionVopdService;
            _rolePlayerNoteService = rolePlayerNoteService;
            _rolePlayerAddressRepository = rolePlayerAddressRepository;
            _benefitService = benefitService;
        }

        public async Task<RolePlayerModel> GetRolePlayer(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.SingleAsync(
                    s => s.RolePlayerId == rolePlayerId,
                    $"Could not find a rolePlayer with the id {rolePlayerId}");
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerAddresses);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerBankingDetails);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.HealthCareProvider);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.BodyCollector);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.FuneralParlor);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Undertaker);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Company);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerRelations_ToRolePlayerId);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerRelations_FromRolePlayerId);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerContacts);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.FinPayee);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerNotes);
                await _rolePlayerContactRepository.LoadAsync(entity.RolePlayerContacts, rp => rp.RolePlayerContactInformations);
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task<RolePlayerExternal> GetRolePlayerForExternal(int rolePlayerId)
        {
            if (RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayerExternal);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.SingleAsync(
                    s => s.RolePlayerId == rolePlayerId,
                    $"Could not find a rolePlayer with the id {rolePlayerId}");
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Company);

                RolePlayerExternal rolePlayerExternal = new RolePlayerExternal();

                if (entity?.Person != null)
                {
                    rolePlayerExternal.RolePlayerId = entity.RolePlayerId;
                    rolePlayerExternal.CellNumber = entity.CellNumber;
                    rolePlayerExternal.FirstName = entity.Person.FirstName;
                    rolePlayerExternal.Surname = entity.Person.Surname;
                    rolePlayerExternal.IdType = entity.Person.IdType;
                    rolePlayerExternal.IdNumber = (entity.Person.IdType == IdTypeEnum.SAIDDocument)
                        ? entity.Person.IdNumber
                        : string.Empty;
                    rolePlayerExternal.PassportNumber = (entity.Person.IdType == IdTypeEnum.PassportDocument)
                        ? entity.Person.IdNumber
                        : string.Empty;
                    rolePlayerExternal.DateOfBirth = entity.Person.DateOfBirth;
                    rolePlayerExternal.IsAlive = entity.Person.IsAlive;
                    rolePlayerExternal.DateOfDeath = entity.Person.DateOfDeath;
                }

                if (entity?.Company != null)
                {
                    rolePlayerExternal.CompanyRolePlayerId = entity.Company.RolePlayerId;
                    rolePlayerExternal.CompanyName = entity.Company.Name;
                    rolePlayerExternal.MemberNumber = entity.Company.ReferenceNumber;
                    rolePlayerExternal.IndustryId = entity.Company.IndustryId;
                    rolePlayerExternal.IndustryClass = entity.Company.IndustryClass;
                    rolePlayerExternal.IndustryNumber = string.Empty; //Set Industry Number here once available
                }

                return rolePlayerExternal;
            }
        }

        public async Task<RolePlayerModel> GetRolePlayerWithoutReferenceData(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.SingleAsync(
                    s => s.RolePlayerId == rolePlayerId,
                    $"Could not find a rolePlayer with the id {rolePlayerId}");
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task<string> GetDisplayName(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.SingleAsync(
                    s => s.RolePlayerId == rolePlayerId,
                    $"Could not find a rolePlayer with the id {rolePlayerId}");
                return entity.DisplayName;
            }
        }

        public async Task<string> GetEmail(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.SingleAsync(
                    s => s.RolePlayerId == rolePlayerId,
                    $"Could not find a rolePlayer with the id {rolePlayerId}");
                return entity.EmailAddress;
            }
        }

        public async Task<RolePlayerRelation> GetDeceasedRelationToMainMember(int policyId, int insuredLifeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                client_RolePlayerRelation relationToMainMember;

                var deceasedIsMainMember = await CheckIfMainMember(policyId, insuredLifeId);
                if (deceasedIsMainMember)
                {
                    // Get the MainMember
                    var result = await GettingMainMemberByPolicyAndToRolePlayerId(policyId, insuredLifeId);
                    relationToMainMember = Mapper.Map<client_RolePlayerRelation>(result);
                }
                else
                {
                    // Get the relation to the mainMember
                    relationToMainMember = await GetRelationshipToMainMember(policyId, insuredLifeId);
                }

                if (relationToMainMember == null)
                {
                    // No relation, just a beneficiary
                    relationToMainMember = await GetBeneficiary(policyId, insuredLifeId);
                }

                return Mapper.Map<RolePlayerRelation>(relationToMainMember);
            }
        }

        public async Task<bool> CheckIfMainMember(int policyId, int insuredLifeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = _rolePlayerRelationRepository
                    .Any(a => a.FromRolePlayerId == insuredLifeId
                           && a.ToRolePlayerId == insuredLifeId
                           && a.PolicyId == policyId);
                return await Task.FromResult(result);
            }
        }

        public async Task<bool> CheckIfGroupPolicy(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayerId = (await _policyRepository.FirstOrDefaultAsync(p => p.PolicyId == policyId))
                    .PolicyOwnerId;
                var result = _rolePlayerRepository.Any(r => r.RolePlayerId == rolePlayerId && r.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Company);
                return await Task.FromResult(result);
            }
        }

        private async Task<client_RolePlayerRelation> GetRelationshipToMainMember(int policyId, int insuredLifeId)
        {
            return await _rolePlayerRelationRepository
                .FirstOrDefaultAsync(a => a.FromRolePlayerId == insuredLifeId
                                          && a.PolicyId == policyId
                                          && a.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary);
        }

        private async Task<client_RolePlayerRelation> GetBeneficiary(int policyId, int insuredLifeId)
        {
            return await _rolePlayerRelationRepository
                .FirstOrDefaultAsync(a => a.FromRolePlayerId == insuredLifeId
                                          && a.PolicyId == policyId
                                          && a.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary);
        }

        public async Task<RolePlayerRelation> GetMainMemberByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var mainMember = await _rolePlayerRelationRepository
                    .FirstOrDefaultAsync(a => a.PolicyId == policyId);
                return Mapper.Map<RolePlayerRelation>(mainMember);
            }
        }

        public async Task<RolePlayerRelation> GettingMainMemberByPolicyAndToRolePlayerId(int policyId,
            int toRolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var mainMember = await _rolePlayerRelationRepository
                    .FirstOrDefaultAsync(a => a.FromRolePlayerId == toRolePlayerId
                                              && a.ToRolePlayerId == toRolePlayerId
                                              && a.PolicyId == policyId
                                              && a.RolePlayerTypeId == (int)RolePlayerTypeEnum.MainMemberSelf);
                return Mapper.Map<RolePlayerRelation>(mainMember);
            }
        }

        public async Task<RolePlayerBankingDetail> GetBankDetailByBankAccountId(int bankAccountId)
        {
            Contract.Requires(bankAccountId > 0);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerBankingDetailRepository.FirstOrDefaultAsync(a => a.RolePlayerBankingId == bankAccountId);
                var rolePlayerBankingDetail = Mapper.Map<RolePlayerBankingDetail>(entity);

                var bankBranch = await _bankBranchService.GetBankBranch(rolePlayerBankingDetail.BankBranchId);
                rolePlayerBankingDetail.BankBranchName = bankBranch.Name;
                rolePlayerBankingDetail.BankName = bankBranch.Bank.Name;
                rolePlayerBankingDetail.BranchCode = bankBranch.Code;
                rolePlayerBankingDetail.IsForeign = bankBranch.Bank.IsForeign;

                return rolePlayerBankingDetail;
            }
        }

        public async Task<RolePlayerModel> SearchRolePlayerByRegistrationNumber(KeyRoleEnum roleType, string registrationNum)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayer = new client_RolePlayer();
                switch (roleType)
                {
                    case KeyRoleEnum.BodyCollector:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a =>
                            a.BodyCollector != null && a.BodyCollector.RegistrationNumber == registrationNum);
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.BodyCollector);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                        }
                        else
                        {
                            rolePlayer = new client_RolePlayer()
                            {
                                Person = new client_Person(),
                                BodyCollector = new client_BodyCollector()
                            };
                        }

                        break;
                    case KeyRoleEnum.FuneralParlor:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a =>
                            a.FuneralParlor != null && a.FuneralParlor.RegistrationNumber == registrationNum);
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.FuneralParlor);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                        }
                        else
                        {
                            rolePlayer = new client_RolePlayer()
                            {
                                Person = new client_Person(),
                                FuneralParlor = new client_FuneralParlor()
                            };
                        }

                        break;
                    case KeyRoleEnum.MedicalServiceProvider:

                        var healthCareProvider = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(registrationNum);

                        if (healthCareProvider != null)
                            rolePlayer = _rolePlayerRepository.FirstOrDefault(a => a.RolePlayerId == healthCareProvider.RolePlayerId);

                        if (rolePlayer.RolePlayerId > 0)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.HealthCareProvider);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                        }
                        else
                        {
                            rolePlayer = new client_RolePlayer()
                            {
                                Person = new client_Person(),
                                HealthCareProvider = new medical_HealthCareProvider()
                            };
                        }

                        break;
                    case KeyRoleEnum.Undertaker:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a =>
                            a.Undertaker != null && a.Undertaker.RegistrationNumber == registrationNum);
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Undertaker);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                        }
                        else
                        {
                            rolePlayer = new client_RolePlayer()
                            {
                                Person = new client_Person(),
                                Undertaker = new client_Undertaker(),
                            };
                        }

                        break;
                    case KeyRoleEnum.InsuredLife:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a =>
                            a.Person != null && a.Person.IdNumber == registrationNum);
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.RolePlayerAddresses);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.RolePlayerContacts);
                            await _rolePlayerContactRepository.LoadAsync(rolePlayer.RolePlayerContacts, rp => rp.RolePlayerContactInformations);
                        }
                        else
                        {
                            rolePlayer = new client_RolePlayer()
                            {
                                Person = new client_Person(),
                                RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person,
                                RolePlayerAddresses = new List<client_RolePlayerAddress>(),
                                ClientType = ClientTypeEnum.Individual
                            };
                        }

                        break;
                }

                return Mapper.Map<RolePlayerModel>(rolePlayer);
            }
        }

        public async Task<List<RolePlayerModel>> SearchRolePlayersByRegistrationNumber(KeyRoleEnum roleType,
            string registrationNum)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayers = new List<client_RolePlayer>();
                switch (roleType)
                {
                    case KeyRoleEnum.BodyCollector:
                        rolePlayers = _rolePlayerRepository.Where(a =>
                            a.BodyCollector != null && a.BodyCollector.RegistrationNumber == registrationNum).ToList();
                        if (rolePlayers != null)
                        {
                            foreach (var rolePlayer in rolePlayers)
                            {
                                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.BodyCollector);
                                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                            }
                        }

                        break;
                    case KeyRoleEnum.FuneralParlor:
                        rolePlayers = _rolePlayerRepository.Where(a =>
                            a.FuneralParlor != null && a.FuneralParlor.RegistrationNumber == registrationNum).ToList();
                        if (rolePlayers != null)
                        {
                            foreach (var rolePlayer in rolePlayers)
                            {
                                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.FuneralParlor);
                                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                            }
                        }

                        break;
                    case KeyRoleEnum.Undertaker:
                        rolePlayers = _rolePlayerRepository.Where(a =>
                            a.Undertaker != null && a.Undertaker.RegistrationNumber == registrationNum).ToList();
                        if (rolePlayers != null)
                        {
                            foreach (var rolePlayer in rolePlayers)
                            {
                                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Undertaker);
                                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                            }
                        }

                        break;
                }

                return Mapper.Map<List<RolePlayerModel>>(rolePlayers);
            }
        }

        public async Task<RolePlayerModel> GetRolePlayerRole(int rolePlayerId, KeyRoleEnum roleType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayer = new client_RolePlayer();
                switch (roleType)
                {
                    case KeyRoleEnum.BodyCollector:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a =>
                            a.BodyCollector != null && a.RolePlayerId == rolePlayerId);
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.BodyCollector);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                        }
                        else
                        {
                            rolePlayer = new client_RolePlayer()
                            {
                                Person = new client_Person(),
                                BodyCollector = new client_BodyCollector()
                            };
                        }

                        break;
                    case KeyRoleEnum.FuneralParlor:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a =>
                            a.FuneralParlor != null && a.RolePlayerId == rolePlayerId);
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.FuneralParlor);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                        }
                        else
                        {
                            rolePlayer = new client_RolePlayer()
                            {
                                Person = new client_Person(),
                                FuneralParlor = new client_FuneralParlor()
                            };
                        }

                        break;

                    case KeyRoleEnum.Undertaker:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a =>
                            a.Undertaker != null && a.RolePlayerId == rolePlayerId);
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Undertaker);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                        }
                        else
                        {
                            rolePlayer = new client_RolePlayer()
                            {
                                Person = new client_Person(),
                                Undertaker = new client_Undertaker(),
                            };
                        }

                        break;
                }

                return Mapper.Map<RolePlayerModel>(rolePlayer);
            }
        }

        public async Task<List<RolePlayerModel>> GetRolePlayerRelations(int rolePlayerId,
            List<RolePlayerTypeEnum> rolePlayerTypes)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository
                    .SingleAsync(rp => rp.RolePlayerId == rolePlayerId,
                        $"Could not find roleplayer with ID {rolePlayerId}");
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerRelations_ToRolePlayerId);
                var rolePlayerIds = entity.RolePlayerRelations_ToRolePlayerId
                    .Where(rp => rolePlayerTypes.Contains((RolePlayerTypeEnum)rp.RolePlayerTypeId))
                    .Select(rp => rp.FromRolePlayerId)
                    .ToList()
                    .Distinct();
                var rolePlayers = await _rolePlayerRepository
                    .Where(rp => rolePlayerIds.Contains(rp.RolePlayerId)
                                 && rp.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person
                                 && !rp.IsDeleted)
                    .ToListAsync();
                await _rolePlayerRepository.LoadAsync(rolePlayers, rp => rp.Person);
                var roleplayers = Mapper.Map<List<RolePlayerModel>>(rolePlayers);
                foreach (var roleplayer in roleplayers)
                {
                    roleplayer.Policies =
                        await _rolePlayerPolicyService.SearchPoliciesByRolePlayerForRelationsCase(
                            roleplayer.RolePlayerId, false);
                }

                return roleplayers;
            }
        }

        public async Task<List<RolePlayerModel>> GetRolePlayers()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _rolePlayerRepository
                    .Where(rolePlayer => !rolePlayer.IsDeleted)
                    .ToListAsync();
                await _rolePlayerRepository.LoadAsync(entities, rp => rp.Person);
                return Mapper.Map<List<RolePlayerModel>>(entities);
            }
        }

        public async Task<List<RolePlayerType>> GetRolePlayerTypes(List<int> rolePlayerTypeIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _rolePlayerTypeRepository
                    .Where(rpt => rolePlayerTypeIds.Contains(rpt.RolePlayerTypeId))
                    .OrderBy(rpt => rpt.Name)
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerType>>(entities);
            }
        }

        public async Task<List<RolePlayerType>> GetRolePlayerIsRelation()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _rolePlayerTypeRepository
                    .Where(rpt => rpt.IsRelation == true)
                    .OrderBy(rpt => rpt.Name)
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerType>>(entities);
            }
        }

        public async Task<int> AddBankingDetails(RolePlayerBankingDetail rolePlayerBankingDetail)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            Contract.Requires(rolePlayerBankingDetail != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var account = new client_RolePlayerBankingDetail()
                {
                    RolePlayerId = rolePlayerBankingDetail.RolePlayerId,
                    AccountHolderName = rolePlayerBankingDetail.AccountHolderName,
                    AccountHolderIdNumber = rolePlayerBankingDetail.AccountHolderIdNumber,
                    AccountNumber = rolePlayerBankingDetail.AccountNumber,
                    ApprovalRequestId = rolePlayerBankingDetail.ApprovalRequestId,
                    ApprovalRequestedFor = rolePlayerBankingDetail.ApprovalRequestedFor,
                    BankAccountType = rolePlayerBankingDetail.BankAccountType,
                    BankBranchId = rolePlayerBankingDetail.BankBranchId,
                    BranchCode = rolePlayerBankingDetail.BranchCode,
                    EffectiveDate = rolePlayerBankingDetail.EffectiveDate,
                    IsApproved = rolePlayerBankingDetail.IsApproved,
                    PurposeId = rolePlayerBankingDetail.PurposeId == 0 ? 1 : rolePlayerBankingDetail.PurposeId,
                    Reason = rolePlayerBankingDetail.Reason,
                    RolePlayerBankingId = rolePlayerBankingDetail.RolePlayerBankingId,
                    Initials = rolePlayerBankingDetail.Initials
                };
                _rolePlayerBankingDetailRepository.Create(account);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return account.RolePlayerId;
            }
        }

        public async Task<int> UpdateBankingDetails(RolePlayerBankingDetail rolePlayerBankingDetail)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRolePlayer);

            Contract.Requires(rolePlayerBankingDetail != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var banking =
                    await _rolePlayerBankingDetailRepository.FirstOrDefaultAsync(a =>
                        a.RolePlayerBankingId == rolePlayerBankingDetail.RolePlayerBankingId);

                banking.RolePlayerId = rolePlayerBankingDetail.RolePlayerId;
                banking.AccountHolderName = rolePlayerBankingDetail.AccountHolderName;
                banking.AccountHolderIdNumber = rolePlayerBankingDetail.AccountHolderIdNumber;
                banking.AccountNumber = rolePlayerBankingDetail.AccountNumber;
                banking.BankAccountType = rolePlayerBankingDetail.BankAccountType;
                banking.BankBranchId = rolePlayerBankingDetail.BankBranchId;
                banking.BranchCode = rolePlayerBankingDetail.BranchCode;
                banking.EffectiveDate = rolePlayerBankingDetail.EffectiveDate;
                banking.IsApproved = rolePlayerBankingDetail.IsApproved;
                banking.PurposeId = rolePlayerBankingDetail.PurposeId == 0 ? 1 : rolePlayerBankingDetail.PurposeId;
                banking.Initials = rolePlayerBankingDetail.Initials;
                _rolePlayerBankingDetailRepository.Update(banking);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return banking.RolePlayerId;
            }
        }

        public async Task<List<Contracts.Entities.RolePlayer.RolePlayer>> GetLinkedRolePlayers(int rolePlayerId,
            List<int> rolePlayerTypeIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _rolePlayerRepository
                    .Where(rp => rp.RolePlayerRelations_FromRolePlayerId
                        .Any(rpr => rpr.ToRolePlayerId == rolePlayerId
                                    && rolePlayerTypeIds.Contains(rpr.RolePlayerTypeId)))
                    .ToListAsync();

                await _rolePlayerRepository.LoadAsync(entities, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(entities, rp => rp.FinPayee);
                await _rolePlayerRepository.LoadAsync(entities, rp => rp.Company);
                await _rolePlayerRepository.LoadAsync(entities, rp => rp.RolePlayerRelations_FromRolePlayerId);

                return Mapper.Map<List<RolePlayerModel>>(entities);
            }
        }

        public async Task<List<RolePlayerRelation>> GetLinkedBeneficiaries(int policyId, int rolePlayerTypeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var beneficiaries = await _rolePlayerRelationRepository
                    .Where(a => a.PolicyId == policyId && a.RolePlayerTypeId == rolePlayerTypeId).ToListAsync();
                return Mapper.Map<List<RolePlayerRelation>>(beneficiaries);
            }
        }

        public async Task<int> CreateRolePlayer(RolePlayerModel rolePlayer)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            Contract.Requires(rolePlayer != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var rolePlayerId = rolePlayer.RolePlayerId;
                rolePlayer.RolePlayerId = 0;

                var entity = Mapper.Map<client_RolePlayer>(rolePlayer);

                entity.RolePlayerId = rolePlayerId > 0 ? rolePlayerId : await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);

                // Adding the rolePlayerId to the relation
                entity.RolePlayerRelations_ToRolePlayerId.ForEach(relation =>
                {
                    if (relation.FromRolePlayerId == 0)
                    {
                        relation.FromRolePlayerId = entity.RolePlayerId;
                    }
                });

                if (entity.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person && entity.Person.IdNumber == "0000000000000")
                {
                    // For preventing duplicate error message for stillborns. DOB contains timestamp
                    entity.Person.IdNumber = entity.RolePlayerId.ToString();
                }

                _rolePlayerRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerId;
            }
        }

        public async Task<int> CreateRolePLayerWithoutRelation(RolePlayerModel rolePlayer)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            Contract.Requires(rolePlayer != null);
            int personRolePlayerId = 0;
            var member = new client_RolePlayer();
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (rolePlayer.Person != null)
                {
                    var data = await _rolePlayerRepository
                        .FirstOrDefaultAsync(r => r.Person.IdType == rolePlayer.Person.IdType
                                                  && r.Person.IdNumber.Equals(rolePlayer.Person.IdNumber,
                                                      StringComparison.OrdinalIgnoreCase));

                    personRolePlayerId = data != null ? data.RolePlayerId : 0;
                }
                if (personRolePlayerId == 0)
                {
                    var rolePlayerId =
                        await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                    rolePlayer.RolePlayerId = rolePlayerId;

                    member = Mapper.Map<client_RolePlayer>(rolePlayer);
                    member.RolePlayerRelations_FromRolePlayerId = null;
                    member.RolePlayerRelations_ToRolePlayerId = null;

                    if (rolePlayer.RolePlayerBankingDetails != null && rolePlayer.RolePlayerBankingDetails.Count > 0)
                    {
                        member.RolePlayerBankingDetails = new List<client_RolePlayerBankingDetail>();
                        foreach (var banking in rolePlayer.RolePlayerBankingDetails)
                        {
                            var mappedBanking = Mapper.Map<client_RolePlayerBankingDetail>(banking);
                            mappedBanking.RolePlayerId = member.RolePlayerId;
                            mappedBanking.PurposeId = 1;
                            member.RolePlayerBankingDetails.Add(mappedBanking);
                        }
                    }

                    _rolePlayerRepository.Create(member);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    await _auditWriter.AddLastViewed<client_RolePlayer>(member.RolePlayerId);
                }

                return member.RolePlayerId != 0 ? member.RolePlayerId : personRolePlayerId;
            }
        }

        public async Task<bool> UpdateRolePlayerRelations(RolePlayerRelation rolePlayerRelation)
        {
            if (rolePlayerRelation == null) return false;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var existingRelationship = await _rolePlayerRelationRepository
                    .FirstOrDefaultAsync(r => r.Id == rolePlayerRelation.Id);
                if (existingRelationship != null)
                {
                    existingRelationship.FromRolePlayerId = rolePlayerRelation.FromRolePlayerId;
                    existingRelationship.ToRolePlayerId = rolePlayerRelation.ToRolePlayerId;
                    existingRelationship.PolicyId = rolePlayerRelation.PolicyId;
                    existingRelationship.RolePlayerTypeId = rolePlayerRelation.RolePlayerTypeId;

                    var data = Mapper.Map<client_RolePlayerRelation>(existingRelationship);
                    _rolePlayerRelationRepository.Update(data, true);

                }
                else
                {
                    var relation = new client_RolePlayerRelation();
                    relation.FromRolePlayerId = rolePlayerRelation.FromRolePlayerId;
                    relation.ToRolePlayerId = rolePlayerRelation.ToRolePlayerId;
                    relation.PolicyId = null;
                    relation.RolePlayerTypeId = rolePlayerRelation.RolePlayerTypeId;

                    _rolePlayerRelationRepository.Create(relation, true);
                }
                return await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
        }

        public async Task EditRolePlayer(RolePlayerModel rolePlayer)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRolePlayer);

            if (rolePlayer != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entity = Mapper.Map<client_RolePlayer>(rolePlayer);

                    if (entity.Person?.IdNumber != null)
                    {
                        if (entity.Person.IdType != IdTypeEnum.SAIDDocument)
                        {
                            entity.Person.IdNumber =
                                FixIdentificationNumber(rolePlayer.RolePlayerId, rolePlayer.Person.IdNumber);
                        }
                        else
                        {
                            entity.Person.IdNumber = rolePlayer.Person.IdNumber;
                        }
                    }

                    _rolePlayerRepository.Update(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    if (rolePlayer.Person?.IdType == IdTypeEnum.SAIDDocument)
                    {
                        rolePlayer.Person.RolePlayerId = entity.RolePlayerId;
                        await RolePlayerVopdMultipleRequest(rolePlayer.Person);
                    }
                }
            }
        }


        public async Task RolePlayerGroupWizardSubmit(Case caseWizard)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRolePlayer);

            if (caseWizard != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    // Benefits are not required to edit a group policy, and a large benefit lists hangs the process
                    caseWizard.MainMember.Policies[0].Benefits = null;

                    var rolePlayer = await SaveRolePlayerBusiness(caseWizard);
                    rolePlayer.Policies[0].JuristicRepresentativeId = caseWizard.JuristicRepresentativeId;
                    await CreatePolicyForCompanyGroup(rolePlayer, caseWizard.ClientReference);
                    var accountNumber = string.IsNullOrEmpty(caseWizard.ClientReference)
                        ? await GetAccountNumber(caseWizard.MainMember)
                        : caseWizard.ClientReference;
                    var industryId = caseWizard.MainMember.Company?.IndustryId;
                    await SaveRolePlayerFinPayeeAccount(accountNumber, rolePlayer.RolePlayerId, industryId, isNaturalPerson: false);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    await _auditWriter.AddLastViewed<client_RolePlayer>(rolePlayer.RolePlayerId);
                }
            }
        }

        private async Task<RolePlayerModel> SaveRolePlayerBusiness(Case rolePlayer)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var data = await _rolePlayerRepository
                    .FirstOrDefaultAsync(r => r.Company.CompanyIdType == rolePlayer.MainMember.Company.CompanyIdType
                                           && r.Company.Name.Equals(rolePlayer.MainMember.Company.Name, StringComparison.OrdinalIgnoreCase));
                var newRolePlayer = data == null;
                if (newRolePlayer)
                {
                    var rolePlayerId =
                        await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                    var member = Mapper.Map<client_RolePlayer>(rolePlayer.MainMember);

                    member.RolePlayerId = rolePlayerId;
                    member.DisplayName = rolePlayer.MainMember.Company.Name;
                    member.TellNumber = rolePlayer.MainMember.Company.ContactTelephone;
                    member.CellNumber = rolePlayer.MainMember.Company.ContactMobile;
                    member.EmailAddress = rolePlayer.MainMember.Company.ContactEmail;
                    member.ClientType = rolePlayer.MainMember.ClientType;
                    member.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Company;

                    member.Person = new client_Person()
                    {
                        RolePlayerId = rolePlayerId,
                        FirstName = rolePlayer.MainMember.Company.ContactPersonName,
                        Surname = rolePlayer.MainMember.Company.Name,
                        IdNumber =
                            Guid.NewGuid().ToString()
                                .ToUpper(), // Using guid because there is no ID number for the company contact and also the field is non-nullable in DB
                        IdType = IdTypeEnum.Other
                    };
                    member.Company = new client_Company()
                    {
                        RolePlayerId = rolePlayerId,
                        Name = rolePlayer.MainMember.Company.Name,
                        ReferenceNumber = rolePlayer.MainMember.Company.ReferenceNumber ?? "",
                        VatRegistrationNo = rolePlayer.MainMember.Company.VatRegistrationNo ?? "",
                        CompanyIdType = rolePlayer.MainMember.Company.CompanyIdType,
                        IndustryClass = rolePlayer.MainMember.Company.IndustryClass,
                        IndustryId = rolePlayer.MainMember.Company.IndustryId,
                        SchemeClassification = new client_SchemeClassification()
                        {
                            RolePlayerId = rolePlayerId,
                            Underwritten = rolePlayer.MainMember.Company.SchemeClassification.Underwritten,
                            PolicyHolderType = rolePlayer.MainMember.Company.SchemeClassification.PolicyHolderType,
                            IsPartnership = rolePlayer.MainMember.Company.SchemeClassification.IsPartnership
                        }
                    };
                    if (rolePlayer.MainMember.RolePlayerAddresses != null &&
                        rolePlayer.MainMember.RolePlayerAddresses.Count > 0)
                    {
                        member.RolePlayerAddresses = new List<client_RolePlayerAddress>();
                        foreach (var address in rolePlayer.MainMember.RolePlayerAddresses)
                        {
                            var mappedAddress = Mapper.Map<client_RolePlayerAddress>(address);
                            mappedAddress.RolePlayerId = rolePlayerId;
                            if (mappedAddress.CountryId < 1)
                            {
                                mappedAddress.CountryId = 1; // defaults to South Africa
                            }

                            member.RolePlayerAddresses.Add(mappedAddress);
                        }
                    }

                    if (rolePlayer.MainMember.RolePlayerBankingDetails != null &&
                        rolePlayer.MainMember.RolePlayerBankingDetails.Count > 0)
                    {
                        member.RolePlayerBankingDetails = new List<client_RolePlayerBankingDetail>();
                        foreach (var banking in rolePlayer.MainMember.RolePlayerBankingDetails)
                        {
                            var mappedBanking = Mapper.Map<client_RolePlayerBankingDetail>(banking);
                            mappedBanking.RolePlayerId = rolePlayerId;
                            mappedBanking.PurposeId = 1; // collections
                            member.RolePlayerBankingDetails.Add(mappedBanking);
                        }
                    }

                    _rolePlayerRepository.Create(member);
                    rolePlayer.MainMember.RolePlayerId = member.RolePlayerId;
                    rolePlayer.MainMember.Company.RolePlayerId = member.RolePlayerId;
                    rolePlayer.MainMember.Person.RolePlayerId = member.RolePlayerId;
                    return rolePlayer.MainMember;
                }
                else
                {
                    data.TellNumber = rolePlayer.MainMember.Company.ContactTelephone;
                    data.CellNumber = rolePlayer.MainMember.Company.ContactMobile;
                    data.EmailAddress = rolePlayer.MainMember.Company.ContactEmail;
                    data.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Company;
                    data.ClientType = ClientTypeEnum.Company;

                    data.Person = new client_Person()
                    {
                        RolePlayerId = data.RolePlayerId,
                        FirstName = rolePlayer.MainMember.Company.ContactPersonName,
                        Surname = rolePlayer.MainMember.Company.Name,
                        IdNumber =
                            Guid.NewGuid().ToString()
                                .ToUpper(), // Using guid because there is no ID number for the company contact and also the field is non-nullable in DB
                        IdType = IdTypeEnum.Other
                    };
                    data.Company = new client_Company()
                    {
                        RolePlayerId = data.RolePlayerId,
                        Name = rolePlayer.MainMember.Company.Name,
                        ReferenceNumber = rolePlayer.MainMember.Company.CompanyRegNo,
                        VatRegistrationNo = rolePlayer.MainMember.Company.ReferenceNumber,
                        CompanyIdType = rolePlayer.MainMember.Company.CompanyIdType,
                        IndustryClass = rolePlayer.MainMember.Company.IndustryClass,
                        IndustryId = rolePlayer.MainMember.Company.IndustryId,
                        SchemeClassification = new client_SchemeClassification()
                        {
                            RolePlayerId = data.RolePlayerId,
                            Underwritten = rolePlayer.MainMember.Company.SchemeClassification.Underwritten,
                            PolicyHolderType = rolePlayer.MainMember.Company.SchemeClassification.PolicyHolderType,
                            IsPartnership = rolePlayer.MainMember.Company.SchemeClassification.IsPartnership
                        }
                    };

                    if (rolePlayer.MainMember.RolePlayerAddresses != null)
                    {
                        data.RolePlayerAddresses = null;
                        data.RolePlayerAddresses = new List<client_RolePlayerAddress>();
                        foreach (var address in rolePlayer.MainMember.RolePlayerAddresses)
                        {
                            var mappedAddress = Mapper.Map<client_RolePlayerAddress>(address);
                            mappedAddress.RolePlayerId = data.RolePlayerId;
                            if (mappedAddress.CountryId < 1)
                            {
                                mappedAddress.CountryId = 1; // defaults to South Africa
                            }

                            data.RolePlayerAddresses.Add(mappedAddress);
                        }
                    }

                    if (rolePlayer.MainMember.RolePlayerBankingDetails != null)
                    {
                        data.RolePlayerBankingDetails = null;
                        data.RolePlayerBankingDetails = new List<client_RolePlayerBankingDetail>();
                        foreach (var banking in rolePlayer.MainMember.RolePlayerBankingDetails)
                        {
                            var mappedBanking = Mapper.Map<client_RolePlayerBankingDetail>(banking);
                            mappedBanking.RolePlayerId = data.RolePlayerId;
                            mappedBanking.PurposeId = 1; // collections
                            data.RolePlayerBankingDetails.Add(mappedBanking);
                        }
                    }

                    _rolePlayerRepository.Update(data);
                    rolePlayer.MainMember.RolePlayerId = data.RolePlayerId;
                    rolePlayer.MainMember.Company.RolePlayerId = data.RolePlayerId;
                    rolePlayer.MainMember.Person.RolePlayerId = data.RolePlayerId;
                    return rolePlayer.MainMember;
                }
            }
        }

        public async Task<Case> RolePlayerIndividualWizardSubmit(Case caseWizard)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            if (caseWizard != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    await SaveRolePlayerPerson(caseWizard.MainMember);
                    var mainMemberId = caseWizard.MainMember.RolePlayerId;
                    await SaveMainMemberBeneficiary(caseWizard.MainMember, caseWizard.Beneficiaries);
                    await SaveRolePlayerPersons(mainMemberId, caseWizard.Beneficiaries, caseWizard.Spouse);
                    await SaveRolePlayerPersons(mainMemberId, caseWizard.Beneficiaries, caseWizard.Children);
                    await SaveRolePlayerPersons(mainMemberId, caseWizard.Beneficiaries, caseWizard.ExtendedFamily);
                    await SaveBeneficiaries(mainMemberId, caseWizard.Beneficiaries);
                    await CreateIndividualPolicy(caseWizard);
                    await UpdateRolePlayerRelationPolicies(caseWizard);
                    var accountNumber = await GetAccountNumber(caseWizard.MainMember);
                    await SaveRolePlayerFinPayeeAccount(accountNumber, mainMemberId, industryId: null, isNaturalPerson: true);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }

            return caseWizard;
        }

        public async Task CreateClaimantFinPayee(RolePlayerModel claimantRecoveryModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRolePlayer);

            Contract.Requires(claimantRecoveryModel != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var accountNumber = await GetAccountNumberIndividual(claimantRecoveryModel);
                var industryId = claimantRecoveryModel.Company?.IndustryId ?? GetDefaultIndustry(claimantRecoveryModel.Company?.IndustryClass);
                var isNaturalPerson = claimantRecoveryModel.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person;
                await SaveRolePlayerFinPayeeAccount(accountNumber, claimantRecoveryModel.RolePlayerId, industryId, isNaturalPerson);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private int GetDefaultIndustry(IndustryClassEnum? industryClass)
        {
            if (!industryClass.HasValue) { return 28; } // Other
            switch (industryClass.Value)
            {
                case IndustryClassEnum.Mining:
                    return 38; // mining_default
                case IndustryClassEnum.Metals:
                    return 39; // metals_default
                case IndustryClassEnum.Other:
                    return 28; // other
                case IndustryClassEnum.Individual:
                    return 40; // individual
                case IndustryClassEnum.Group:
                    return 41; // group
                case IndustryClassEnum.Senna:
                    return 42; // senna
                default:
                    return 28; // other
            }
        }

        private async Task SaveRolePlayerFinPayeeAccount(
            string accountNumber,
            int policyOwnerId,
            int? industryId,
            bool isNaturalPerson)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (isNaturalPerson)
                {
                    industryId = 22; //individual
                }

                var roleplayerAccount =
                    await _finPayeeRepository.FirstOrDefaultAsync(s => s.RolePlayerId == policyOwnerId);
                if (roleplayerAccount != null)
                {
                    return;
                }

                var account = new client_FinPayee
                {
                    RolePlayerId = policyOwnerId,
                    FinPayeNumber = accountNumber,
                    IsAuthorised = true,
                    AuthroisedBy = RmaIdentity.Username,
                    AuthorisedDate = DateTimeHelper.SaNow,
                    IndustryId = industryId
                };

                _finPayeeRepository.Create(account);
            }
        }

        private async Task CreateIndividualPolicy(Case caseWizard)
        {
            if (caseWizard.MainMember == null) return;
            if (caseWizard.MainMember.Policies == null) return;

            using (var scope = this._dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                foreach (var owner in caseWizard.MainMember.Policies)
                {
                    var policy = Mapper.Map<policy_Policy>(owner);
                    var currentPolicy =
                        await this._policyRepository.FirstOrDefaultAsync(p => p.PolicyNumber == policy.PolicyNumber);

                    if (currentPolicy != null)
                    {
                        // Generate a new policy number, if the policy number already exist in the database 
                        var newPolicyNumber =
                            await this._documentGeneratorService.GenerateDocumentNumber(
                                DocumentNumberTypeEnum.PolicyNumber, "01");
                        policy.PolicyNumber = newPolicyNumber;
                        owner.PolicyNumber = newPolicyNumber;
                    }

                    policy.PolicyId =
                        await this._documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber);
                    policy.AnnualPremium = owner.AnnualPremium;
                    policy.BrokerageId = owner.BrokerageId;
                    policy.ProductOption = null;
                    policy.ProductOptionId = owner.ProductOptionId;
                    policy.PolicyInsuredLives = new List<policy_PolicyInsuredLife>();
                    policy.JuristicRepresentativeId = caseWizard.JuristicRepresentativeId;
                    policy.FirstInstallmentDate = owner.FirstInstallmentDate.ToSaDateTime();
                    policy.ClientReference = string.IsNullOrEmpty(policy.ClientReference) ? null : policy.ClientReference;

                    policy.IsEuropAssist = owner.IsEuropAssist;
                    policy.EuropAssistEffectiveDate = owner.EuropAssistEffectiveDate;
                    policy.EuropAssistEndDate = owner.EuropAssistEndDate;

                    AddInsuredLife(policy, caseWizard.MainMember, RolePlayerTypeEnum.MainMemberSelf);
                    AddInsuredLives(policy, caseWizard.Spouse, RolePlayerTypeEnum.Spouse);
                    AddInsuredLives(policy, caseWizard.Children, RolePlayerTypeEnum.Child);
                    AddInsuredLives(policy, caseWizard.ExtendedFamily, RolePlayerTypeEnum.Extended);

                    // Load the selected benefits
                    var benefitIds = owner.Benefits.Select(b => b.Id).Distinct().ToList();
                    var benefits = await _benefitService.GetBenefitsByBenefitIds(benefitIds);
                    policy.Benefits = Mapper.Map<List<product_Benefit>>(benefits);

                    policy.PolicyOwnerId = caseWizard.MainMember.RolePlayerId;
                    policy.PolicyPayeeId = caseWizard.MainMember.RolePlayerId;

                    policy.PolicyBrokers = new List<policy_PolicyBroker>
                    {
                        new policy_PolicyBroker()
                        {
                            BrokerageId = owner.BrokerageId,
                            RepId = owner.RepresentativeId,
                            EffectiveDate = DateTimeHelper.SaNow,
                            JuristicRepId = caseWizard.JuristicRepresentativeId,
                            PolicyId = policy.PolicyId
                        }
                    };

                    policy.CanLapse = true;

                    _policyRepository.Create(policy);
                    owner.PolicyId = policy.PolicyId;
                }
            }
        }

        private void AddInsuredLives(policy_Policy policy, List<RolePlayerModel> members, RolePlayerTypeEnum rolePlayerType)
        {
            if (members == null) return;
            foreach (var member in members)
            {
                AddInsuredLife(policy, member, rolePlayerType);
            }
        }

        private void AddInsuredLife(policy_Policy policy, RolePlayerModel member, RolePlayerTypeEnum rolePlayerType)
        {
            if (member.Benefits != null)
            {
                foreach (var benefit in member.Benefits)
                {
                    var insuredLive = new policy_PolicyInsuredLife()
                    {
                        RolePlayerId = member.RolePlayerId,
                        PolicyId = policy.PolicyId,
                        RolePlayerTypeId = (int)rolePlayerType,
                        InsuredLifeStatus = InsuredLifeStatusEnum.Active,
                        StartDate = (member.JoinDate.HasValue ? member.JoinDate.Value : policy.PolicyInceptionDate)
                            .ToSaDateTime().Date,
                        StatedBenefitId = benefit.Id
                    };

                    policy.PolicyInsuredLives.Add(insuredLive);
                }
            }
        }

        private Task UpdateRolePlayerRelationPolicies(Case caseWizard)
        {
            if (caseWizard.MainMember == null) return Task.CompletedTask;
            if (caseWizard.MainMember.Policies == null) return Task.CompletedTask;
            if (caseWizard.MainMember.Policies.Count == 0) return Task.CompletedTask;
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var policyId = caseWizard.MainMember.Policies[0].PolicyId;
                var relations = new List<RolePlayerRelation>();

                caseWizard.MainMember.FromRolePlayers.ForEach(r =>
                    r.FromRolePlayerId = caseWizard.MainMember.RolePlayerId);
                caseWizard.MainMember.FromRolePlayers.ForEach(
                    r => r.ToRolePlayerId = caseWizard.MainMember.RolePlayerId);
                relations.AddRange(caseWizard.MainMember.FromRolePlayers);

                relations.AddRange(GetRolePlayerRelations(caseWizard.Spouse));
                relations.AddRange(GetRolePlayerRelations(caseWizard.Children));
                relations.AddRange(GetRolePlayerRelations(caseWizard.ExtendedFamily));
                relations.AddRange(GetRolePlayerRelations(caseWizard.Beneficiaries));
                relations.ForEach(r => r.PolicyId = policyId);

                var data = Mapper.Map<List<client_RolePlayerRelation>>(relations);
                // Set skipAuditing to true, otherwise it loads a LOT of policies
                // and roleplayers and benefits, and hangs the entire process
                _rolePlayerRelationRepository.Create(data, true);
            }

            return Task.CompletedTask;
        }

        private List<RolePlayerRelation> GetRolePlayerRelations(List<RolePlayerModel> members)
        {
            var relations = new List<RolePlayerRelation>();
            if (members == null) return relations;
            foreach (var member in members)
            {
                member.FromRolePlayers.ForEach(rp => rp.FromRolePlayerId = member.RolePlayerId);
            }

            members.ForEach(m => relations.AddRange(m.FromRolePlayers));
            return relations;
        }

        private async Task SaveMainMemberBeneficiary(RolePlayerModel mainMember, List<RolePlayerModel> beneficiaries)
        {
            if (beneficiaries == null) return;
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var idx = beneficiaries
                    .FindIndex(b => b.Person.IdType == mainMember.Person.IdType
                                    && b.Person.IdNumber.Equals(mainMember.Person.IdNumber,
                                        StringComparison.OrdinalIgnoreCase));
                if (idx >= 0)
                {
                    var data = await _rolePlayerRelationRepository
                        .FirstOrDefaultAsync(r => r.FromRolePlayerId == mainMember.RolePlayerId
                                                  && r.ToRolePlayerId == mainMember.RolePlayerId
                                                  && r.RolePlayerTypeId == (int)RolePlayerTypeEnum.Beneficiary
                                                  && r.PolicyId == null);
                    if (data != null) return;
                    var relation = new RolePlayerRelation
                    {
                        Id = 0,
                        FromRolePlayerId = mainMember.RolePlayerId,
                        ToRolePlayerId = mainMember.RolePlayerId,
                        RolePlayerTypeId = (int)RolePlayerTypeEnum.Beneficiary
                    };
                    mainMember.FromRolePlayers.Add(relation);
                    beneficiaries.RemoveAt(idx);
                }
            }
        }

        private async Task SaveBeneficiaries(int mainMemberId, List<RolePlayerModel> beneficiaries)
        {
            if (beneficiaries == null) return;

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                foreach (var beneficiary in beneficiaries)
                {
                    if (beneficiary.FromRolePlayers.FirstOrDefault(a =>
                            a.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary) != null)
                    {
                        beneficiary.FromRolePlayers.Remove(beneficiary.FromRolePlayers.FirstOrDefault(a =>
                            a.RolePlayerTypeId != (int)RolePlayerTypeEnum.Beneficiary));
                    }

                    beneficiary.FromRolePlayers.Add(
                        new RolePlayerRelation
                        {
                            Id = 0,
                            FromRolePlayerId = 0,
                            ToRolePlayerId = mainMemberId,
                            RolePlayerTypeId = (int)RolePlayerTypeEnum.Beneficiary
                        }
                    );

                    await SaveRolePlayerPerson(beneficiary);

                }
            }
        }

        public async Task SaveRolePlayerPersons(int mainMemberId, List<RolePlayerModel> beneficiaries,
            List<RolePlayerModel> roleplayers)
        {
            if (roleplayers == null) return;
            if (roleplayers.Count == 0) return;
            foreach (var roleplayer in roleplayers)
            {
                if (beneficiaries != null)
                {
                    var idx = beneficiaries
                        .FindIndex(b =>
                            b.Person.IdNumber.Equals(roleplayer.Person.IdNumber, StringComparison.OrdinalIgnoreCase));

                    if (idx >= 0)
                    {
                        roleplayer.FromRolePlayers.Add(
                            new RolePlayerRelation
                            {
                                Id = 0,
                                FromRolePlayerId = 0,
                                ToRolePlayerId = mainMemberId,
                                RolePlayerTypeId = (int)RolePlayerTypeEnum.Beneficiary
                            }
                        );

                        beneficiaries.RemoveAt(idx);
                    }
                }

                foreach (var relation in roleplayer.FromRolePlayers)
                {
                    relation.ToRolePlayerId = mainMemberId;
                }

                await SaveRolePlayerPerson(roleplayer);
            }
        }

        private async Task<int> SaveRolePlayerPerson(RolePlayerModel roleplayer)
        {
            var rolePlayerUpdatedId = 0;
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var data = await _rolePlayerRepository
                    .FirstOrDefaultAsync(r =>
                        r.Person.IdNumber.Equals(roleplayer.Person.IdNumber, StringComparison.OrdinalIgnoreCase));

                var newRolePlayer = data == null;
                if (newRolePlayer)
                {
                    roleplayer.RolePlayerBankingDetails?.ForEach(
                        detail => detail.PurposeId = detail.PurposeId == 0 ? 1 : detail.PurposeId
                    );
                    var rolePlayerId =
                        await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                    roleplayer.RolePlayerId = rolePlayerId;
                    roleplayer.BodyCollector = null;
                    roleplayer.ForensicPathologist = null;
                    roleplayer.FuneralParlor = null;
                    roleplayer.Informant = null;
                    roleplayer.HealthCareProvider = null;
                    roleplayer.Undertaker = null;
                    roleplayer.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                    roleplayer.IsDeleted = false;
                    roleplayer.Person.RolePlayerId = rolePlayerId;
                    if (roleplayer.Person.IdType != IdTypeEnum.SAIDDocument)
                    {
                        roleplayer.Person.IdNumber = FixIdentificationNumber(rolePlayerId, roleplayer.Person.IdNumber);
                    }

                    roleplayer.Person.DateOfBirth = roleplayer.Person.DateOfBirth.ToSaDateTime();
                    var entity = Mapper.Map<client_RolePlayer>(roleplayer);
                    entity.RolePlayerRelations_FromRolePlayerId = null;
                    _rolePlayerRepository.Create(entity);
                    rolePlayerUpdatedId = rolePlayerId;
                }
                else
                {
                    await _rolePlayerRepository.LoadAsync(data, rp => rp.Person);
                    await _rolePlayerRepository.LoadAsync(data, rp => rp.RolePlayerRelations_FromRolePlayerId);
                    data.DisplayName = roleplayer.DisplayName;
                    data.TellNumber = roleplayer.TellNumber;
                    data.CellNumber = roleplayer.CellNumber;
                    data.EmailAddress = roleplayer.EmailAddress;
                    data.PreferredCommunicationTypeId = roleplayer.PreferredCommunicationTypeId;
                    data.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                    data.IsDeleted = false;
                    data.Person.FirstName = roleplayer.Person.FirstName;
                    data.Person.Surname = roleplayer.Person.Surname;
                    data.Person.DateOfBirth = roleplayer.Person.DateOfBirth.ToSaDateTime();
                    data.Person.IsStudying = roleplayer.Person.IsStudying;
                    data.Person.IsDisabled = roleplayer.Person.IsDisabled;
                    data.Person.IsDeleted = false;

                    if (roleplayer.RolePlayerAddresses != null)
                    {
                        data.RolePlayerAddresses = null;
                        data.RolePlayerAddresses = new List<client_RolePlayerAddress>();
                        foreach (var address in roleplayer.RolePlayerAddresses)
                        {
                            var mappedAddress = Mapper.Map<client_RolePlayerAddress>(address);
                            mappedAddress.RolePlayerId = data.RolePlayerId;
                            if (mappedAddress.CountryId < 1)
                            {
                                mappedAddress.CountryId = 1; // defaults to South Africa
                            }

                            data.RolePlayerAddresses.Add(mappedAddress);
                        }
                    }

                    if (roleplayer.RolePlayerBankingDetails?.Count > 0)
                    {
                        data.RolePlayerBankingDetails = null;
                        data.RolePlayerBankingDetails = new List<client_RolePlayerBankingDetail>();
                        foreach (var banking in roleplayer.RolePlayerBankingDetails)
                        {
                            banking.PurposeId = banking.PurposeId != 0 ? banking.PurposeId : 1;

                            var mappedBanking = Mapper.Map<client_RolePlayerBankingDetail>(banking);
                            mappedBanking.RolePlayerId = data.RolePlayerId;
                            mappedBanking.PurposeId = 1; // collections
                            data.RolePlayerBankingDetails.Add(mappedBanking);
                        }
                    }

                    _rolePlayerRepository.Update(data);
                    var rolePlayerId = data.RolePlayerId;
                    rolePlayerUpdatedId = rolePlayerId;
                    roleplayer.RolePlayerId = rolePlayerId;
                    roleplayer.Person.RolePlayerId = rolePlayerId;
                }
            }

            return rolePlayerUpdatedId;
        }

        private string FixIdentificationNumber(int rolePlayerId, string idNumber)
        {
            if (DateTime.TryParse(idNumber, out DateTime dtm))
            {
                return $"{dtm:yyyy/MM/dd}-{rolePlayerId}";
            }

            // Just return the captured ID number if it is note a date for now,
            // we can add some more alterations later as required.
            return idNumber;
        }

        public async Task<List<RolePlayerModel>> GetPersonRolePlayerByIdNumber(IdTypeEnum idType, string query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roleplayer = await _rolePlayerRepository
                    .Where(c => !c.IsDeleted
                                && c.Person.IdNumber.Equals(query, StringComparison.InvariantCultureIgnoreCase))
                    .ToListAsync();
                await _rolePlayerRepository.LoadAsync(roleplayer, d => d.Person);
                return Mapper.Map<List<RolePlayerModel>>(roleplayer);
            }
        }

        public async Task<List<RolePlayerModel>> GetRolePlayerByIdNumber(string idNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roleplayer = await _rolePlayerRepository
                    .Where(c => c.Person.IdNumber.Equals(idNumber, StringComparison.InvariantCultureIgnoreCase))
                    .ToListAsync();
                await _rolePlayerRepository.LoadAsync(roleplayer, d => d.Person);
                return Mapper.Map<List<RolePlayerModel>>(roleplayer);
            }
        }

        public async Task AddRolePlayerRelation(RolePlayerRelation rolePlayerRelation)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRolePlayer);

            using (var scope = _dbContextScopeFactory.Create())
            {
                _rolePlayerRelationRepository.Create(Mapper.Map<client_RolePlayerRelation>(rolePlayerRelation), true);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<RolePlayerRelation> GetRelationByRolePlayerType(int fromRolePlayerId,
            RolePlayerTypeEnum rolePlayerTypeEnum, int policyId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var result = await _rolePlayerRelationRepository
                    .FirstOrDefaultAsync(a => a.FromRolePlayerId == fromRolePlayerId
                                              && a.RolePlayerTypeId == (int)rolePlayerTypeEnum
                                              && a.PolicyId == policyId);
                return Mapper.Map<RolePlayerRelation>(result);
            }
        }

        public async Task<bool> DoesRelationExist(RolePlayerRelation rolePlayerRelation)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                return await Task.FromResult(_rolePlayerRelationRepository
                    .Any(a => a.FromRolePlayerId == rolePlayerRelation.FromRolePlayerId
                              && a.ToRolePlayerId == rolePlayerRelation.ToRolePlayerId
                              && a.RolePlayerTypeId == rolePlayerRelation.RolePlayerTypeId
                              && a.PolicyId == rolePlayerRelation.PolicyId));
            }
        }

        public async Task<List<RolePlayerBankingDetail>> GetBankingDetailsByRolePlayerId(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _rolePlayerBankingDetailRepository.Where(b => b.RolePlayerId == rolePlayerId).ToListAsync();
                var rolePlayerBankingDetails = Mapper.Map<List<RolePlayerBankingDetail>>(results);

                foreach (var rolePlayerBankingDetail in rolePlayerBankingDetails)
                {
                    var bankBranch = await _bankBranchService.GetBankBranch(rolePlayerBankingDetail.BankBranchId);
                    rolePlayerBankingDetail.BankName = bankBranch.Bank.Name;
                }

                return rolePlayerBankingDetails;
            }
        }

        public async Task<RolePlayerModel> GetPersonDetailsByIdNumber(IdTypeEnum idType, string query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var roleplayer = await _rolePlayerRepository
                    .FirstOrDefaultAsync(
                        c => !c.IsDeleted
                             && c.Person.IdNumber.Equals(query, System.StringComparison.InvariantCultureIgnoreCase)
                             && c.Person.IdType == idType);

                if (roleplayer != null)
                {
                    await _rolePlayerRepository.LoadAsync(roleplayer, d => d.Person);
                    return Mapper.Map<RolePlayerModel>(roleplayer);
                }
                else
                {
                    roleplayer = new client_RolePlayer()
                    {
                        Person = new client_Person(),
                        FuneralParlor = new client_FuneralParlor()
                    };
                    return Mapper.Map<RolePlayerModel>(roleplayer);
                }
            }
        }

        public Task<bool> ProcessVopdMessages()
        {
            throw new NotImplementedException();
        }

        public async Task<int> SaveRolePlayer(RolePlayerModel rolePlayer, int parentRolePlayer, RolePlayerTypeEnum relation)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            Contract.Requires(rolePlayer != null);
            var member = Mapper.Map<client_RolePlayer>(rolePlayer);
            if (parentRolePlayer != 0)
            {
                member.RolePlayerId =
                    await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
            }

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                member.DisplayName = $"{member.Person.FirstName} {member.Person.Surname}".Trim();
                member.Person.RolePlayerId = member.RolePlayerId;
                if (member.Person.IdType != IdTypeEnum.SAIDDocument)
                {
                    member.Person.IdNumber = FixIdentificationNumber(member.RolePlayerId, member.Person.IdNumber);
                }

                member.CellNumber = rolePlayer.CellNumber;
                member.EmailAddress = rolePlayer.EmailAddress;
                member.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                member.TellNumber = rolePlayer.TellNumber;

                if (rolePlayer.RolePlayerAddresses != null && rolePlayer.RolePlayerAddresses.Count > 0)
                {
                    member.RolePlayerAddresses = new List<client_RolePlayerAddress>();
                    foreach (var address in rolePlayer.RolePlayerAddresses)
                    {
                        var mappedAddress = Mapper.Map<client_RolePlayerAddress>(address);
                        mappedAddress.RolePlayerId = member.RolePlayerId;
                        if (mappedAddress.CountryId < 1)
                        {
                            mappedAddress.CountryId = 1; //hard coded to south africa
                        }

                        member.RolePlayerAddresses.Add(mappedAddress);
                    }
                }

                if (rolePlayer.RolePlayerBankingDetails != null && rolePlayer.RolePlayerBankingDetails.Count > 0)
                {
                    foreach (var account in rolePlayer.RolePlayerBankingDetails.Select(banking =>
                        new client_RolePlayerBankingDetail()
                        {
                            RolePlayerId = member.RolePlayerId,
                            AccountHolderName = banking.AccountHolderName,
                            AccountNumber = banking.AccountNumber,
                            ApprovalRequestId = banking.ApprovalRequestId,
                            ApprovalRequestedFor = banking.ApprovalRequestedFor,
                            BankAccountType = banking.BankAccountType,
                            BankBranchId = banking.BankBranchId,
                            BranchCode = banking.BranchCode,
                            EffectiveDate = banking.EffectiveDate,
                            IsApproved = banking.IsApproved,
                            PurposeId = banking.PurposeId == 0 ? 1 : banking.PurposeId,
                            Reason = banking.Reason,
                            RolePlayerBankingId = banking.RolePlayerBankingId,
                        }))
                    {
                        member.RolePlayerBankingDetails.Add(account);
                    }
                }

                if (parentRolePlayer != 0)
                {
                    var toMain = new client_RolePlayerRelation()
                    {
                        FromRolePlayerId = member.RolePlayerId,
                        ToRolePlayerId = parentRolePlayer,
                        RolePlayerTypeId = (int)relation,
                        PolicyId = rolePlayer.PolicyId

                    };
                    member.RolePlayerRelations_FromRolePlayerId = new List<client_RolePlayerRelation>() { toMain };
                }

                //rolePlayer.FromRolePlayers 
                _rolePlayerRepository.Create(member);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _auditWriter.AddLastViewed<client_RolePlayer>(member.RolePlayerId);
                return member.RolePlayerId;
            }
        }

        private async Task CreatePolicyForCompanyGroup(RolePlayerModel roleplayer, string clientreference)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddPolicy);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var owner = roleplayer.Policies[0];
                var policy = new policy_Policy();
                var accountNumber = await GetAccountNumber(roleplayer);
                policy = Mapper.Map<policy_Policy>(owner);
                policy.PolicyId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.PolicyNumber);
                policy.PolicyNumber = $"01-{DateTime.Today:yyMMdd}-{policy.PolicyId:000000}";
                policy.AnnualPremium = owner.AnnualPremium;
                policy.BrokerageId = owner.BrokerageId;
                if (owner.IsEuropAssist)
                {
                    policy.IsEuropAssist = owner.IsEuropAssist;
                    policy.EuropAssistEffectiveDate = owner.PolicyInceptionDate;
                }

                policy.PolicyOwnerId = roleplayer.RolePlayerId;
                policy.PolicyPayeeId = roleplayer.RolePlayerId;
                policy.JuristicRepresentativeId = owner.JuristicRepresentativeId;
                policy.ClientReference = string.IsNullOrEmpty(clientreference) ? null : clientreference;
                policy.FirstInstallmentDate = owner.FirstInstallmentDate.ToSaDateTime();

                policy.PolicyBrokers = new List<policy_PolicyBroker>
                {
                    new policy_PolicyBroker()
                    {
                        BrokerageId = owner.BrokerageId,
                        RepId = owner.RepresentativeId,
                        EffectiveDate = DateTimeHelper.SaNow,
                        JuristicRepId = owner.JuristicRepresentativeId,
                        PolicyId = policy.PolicyId
                    }
                };

                if (owner.BrokerPolicyContact != null)
                {
                    policy.PolicyContacts.Add(new policy_PolicyContact
                    {
                        PolicyId = policy.PolicyId,
                        ContactName = owner.BrokerPolicyContact.ContactName,
                        TelephoneNumber = owner.BrokerPolicyContact.TelephoneNumber,
                        MobileNumber = owner.BrokerPolicyContact.MobileNumber,
                        AlternativeNumber = owner.BrokerPolicyContact.AlternativeNumber,
                        EmailAddress = owner.BrokerPolicyContact.EmailAddress,
                        ContactType = owner.BrokerPolicyContact.ContactType
                    });
                }

                if (owner.AdminPolicyContact != null)
                {
                    policy.PolicyContacts.Add(new policy_PolicyContact
                    {
                        PolicyId = policy.PolicyId,
                        ContactName = owner.AdminPolicyContact.ContactName,
                        TelephoneNumber = owner.AdminPolicyContact.TelephoneNumber,
                        MobileNumber = owner.AdminPolicyContact.MobileNumber,
                        AlternativeNumber = owner.AdminPolicyContact.AlternativeNumber,
                        EmailAddress = owner.AdminPolicyContact.EmailAddress,
                        ContactType = owner.AdminPolicyContact.ContactType
                    });
                }

                if (owner.PolicyDocumentCommunicationMatrix != null)
                {
                    policy.PolicyDocumentCommunicationMatrices = new List<policy_PolicyDocumentCommunicationMatrix>
                    {
                        new policy_PolicyDocumentCommunicationMatrix
                        {
                            PolicyId = policy.PolicyId,
                            SendPolicyDocsToBroker = owner.PolicyDocumentCommunicationMatrix.SendPolicyDocsToBroker,
                            SendPolicyDocsToAdmin = owner.PolicyDocumentCommunicationMatrix.SendPolicyDocsToAdmin,
                            SendPolicyDocsToMember = owner.PolicyDocumentCommunicationMatrix.SendPolicyDocsToMember,
                            SendPolicyDocsToScheme = owner.PolicyDocumentCommunicationMatrix.SendPolicyDocsToScheme,
                            SendPaymentScheduleToBroker = owner.PolicyDocumentCommunicationMatrix.SendPaymentScheduleToBroker
                        }
                    };
                }

                policy.PolicyInsuredLives = null;
                policy.CanLapse = true;

                _policyRepository.Create(policy);
            }
        }

        public async Task<bool> RolePlayerVopdRequest(Person rolePlayer)
        {
            await RolePlayerVopdMultipleRequest(rolePlayer);
            return true;
        }

        public async Task RolePlayerVopdMultipleRequest(Person rolePlayer)
        {
            Contract.Requires(rolePlayer != null);
            var vopdRequest = new VopdRequestMessage()
            {
                RolePlayerId = rolePlayer.RolePlayerId,
                IdNumber = rolePlayer.IdNumber,
                IdReferenceNo = rolePlayer.IdNumber,
                MessageId = Guid.NewGuid().ToString(),
                VerificationType = VopdVerificationType.Status
            };

            vopdRequest.ImpersonateUser = SystemSettings.SystemUserAccount;
            if (await _configurationService.IsFeatureFlagSettingEnabled(IsVopdQuickTransactEnabled))
            {
                await CreatePersonVopdResponse(rolePlayer);

                var vopdResponseMessage = await _quickTransactionVopdService.SubmitVOPDRequest(vopdRequest);
                if (vopdResponseMessage.statusCode == "200")
                {
                    await RolePlayerVopdUpdate(vopdResponseMessage.VerificationResponse);
                }
            }
            else
            {
                var producer = new ServiceBusQueueProducer<VopdRequestMessage, VopdRequestMessageListener>(VopdRequestMessageListener.QueueName);
                await producer.PublishMessageAsync(vopdRequest);
            }
        }

        private async Task CreatePersonVopdResponse(Person person)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var vopdResponse = new client_VopdResponse()
                {
                    RolePlayerId = person.RolePlayerId,
                    IdNumber = person.IdNumber,
                    VopdStatus = VopdStatusEnum.Processing,
                    SubmittedDate = DateTimeHelper.SaNow
                };
                _vopdResponseRepository.Create(vopdResponse);
                await scope.SaveChangesAsync();
            }
        }

        public async Task<QuickVopdResponseMessage> PersonVopdRequest(string saId)
        {
            await CreateUserVopdResponseRecord(saId);
            var vopdMessage = await GetVopdRequestMessage(saId);
            var vopdResponseMessage = await _quickTransactionVopdService.SubmitVOPDRequest(vopdMessage);
            if (vopdResponseMessage.statusCode == "200")
            {
                await UserVopdUpdate(vopdResponseMessage.VerificationResponse);
            }
            return vopdResponseMessage;
        }

        public async Task<bool> UserPlayerVopdRequest(string saId)
        {
            await CreateUserVopdResponseRecord(saId);
            var vopdMessage = await GetVopdRequestMessage(saId);

            if (await _configurationService.IsFeatureFlagSettingEnabled(IsVopdQuickTransactEnabled))
            {
                var vopdResponseMessage = await _quickTransactionVopdService.SubmitVOPDRequest(vopdMessage);
                if (vopdResponseMessage.statusCode == "200")
                {
                    await UserVopdUpdate(vopdResponseMessage.VerificationResponse);
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                var producer = new ServiceBusQueueProducer<VopdRequestMessage, VopdRequestMessageListener>(VopdRequestMessageListener.QueueName);
                await producer.PublishMessageAsync(vopdMessage);
                return true;
            }
        }

        private async Task CreateUserVopdResponseRecord(string saId)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                if (!await _userVopdResponseRepository.AnyAsync(a => a.IdNumber == saId))
                {
                    var message = new client_UserVopdResponse()
                    {
                        IdNumber = saId,
                        VopdStatus = VopdStatusEnum.Processing
                    };

                    _userVopdResponseRepository.Create(message);
                    await scope.SaveChangesAsync();
                }
            }
        }

        private async Task<VopdRequestMessage> GetVopdRequestMessage(string saId)
        {
            var impersonateUser = await _configurationService.GetModuleSetting(SystemSettings.SystemUser);
            var vopdMessage = new VopdRequestMessage()
            {
                IdNumber = saId,
                IdReferenceNo = saId,
                MessageId = Guid.NewGuid().ToString(),
                VerificationType = VopdVerificationType.Status,
                ImpersonateUser = impersonateUser
            };
            return vopdMessage;
        }

        public async Task<List<ClientVopdResponse>> GetUnprocessedVopdRequest()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var vopdResponses = await _vopdResponseRepository.Where(i => i.VopdStatus == VopdStatusEnum.Processing
                && i.DateVerified == null && i.ResubmittedDate == null).OrderByDescending(x => x.VopdResponseId).Take(5).ToListAsync();

                return Mapper.Map<List<ClientVopdResponse>>(vopdResponses);
            }
        }

        public async Task ResubmitRolePlayerVopdRequest(Person rolePlayer)
        {
            Contract.Requires(rolePlayer != null);
            var vopdMessageStatus = new VopdRequestMessage()
            {
                RolePlayerId = rolePlayer.RolePlayerId,
                IdNumber = rolePlayer.IdNumber,
                IdReferenceNo = rolePlayer.IdNumber,
                MessageId = Guid.NewGuid().ToString(),
                VerificationType = VopdVerificationType.Status
            };
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var vopdResponse = await _vopdResponseRepository.FirstOrDefaultAsync(x => x.RolePlayerId == rolePlayer.RolePlayerId);
                vopdResponse.VopdStatus = VopdStatusEnum.Processing;
                vopdResponse.ResubmittedDate = DateTimeHelper.SaNow;

                _vopdResponseRepository.Update(vopdResponse);
                await scope.SaveChangesAsync();
            }

            vopdMessageStatus.ImpersonateUser = SystemSettings.SystemUserAccount;
            if (await _configurationService.IsFeatureFlagSettingEnabled(IsVopdQuickTransactEnabled))
            {
                var vopdResponseMessage = await _quickTransactionVopdService.SubmitVOPDRequest(vopdMessageStatus);
                if (vopdResponseMessage.statusCode == "200")
                {
                    await RolePlayerVopdUpdate(vopdResponseMessage.VerificationResponse);
                }
            }
            else
            {
                var producer = new ServiceBusQueueProducer<VopdRequestMessage, VopdRequestMessageListener>(VopdRequestMessageListener.QueueName);
                await producer.PublishMessageAsync(vopdMessageStatus);
            }
        }

        public Task<bool> ReInstatePolicy()
        {
            return Task.FromResult(true);
        }

        public async Task<bool> CheckVopdStatus(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = _rolePlayerRepository.Any(a => a.RolePlayerId == rolePlayerId && a.Person.IsVopdVerified);
                return await Task.FromResult(result);
            }
        }

        public Task<bool> LapsePolicy()
        {
            // this will need to ingegrate into billing, fine policies 2 unmet prem
            // api to generate docs
            return Task.FromResult(true);
        }

        public Task<bool> SendLapsePolicy30Days()
        {
            //after 30 days send document lapse.
            return Task.FromResult(true);
        }

        #region Lookups

        public async Task<List<Contracts.Entities.Policy.Policy>> GetAllPoliciesByInsureLifeId(int insuredLifeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPolicy);

            using (_dbContextScopeFactory.Create())
            {
                var policies = await _policyRepository
                    .Where(p => p.PolicyInsuredLives.Any(a => a.RolePlayerId == insuredLifeId)).ToListAsync();
                return Mapper.Map<List<Contracts.Entities.Policy.Policy>>(policies);
            }
        }

        public async Task<List<RolePlayerModel>> GetInsuredLifeByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.Create())
            {
                var insuredLives = await _rolePlayerRepository
                    .Where(p => p.PolicyInsuredLives.Any(a => a.PolicyId == policyId)).ToListAsync();
                await _rolePlayerRepository.LoadAsync(insuredLives, a => a.Person);

                return Mapper.Map<List<RolePlayerModel>>(insuredLives);
            }
        }

        public async Task<RolePlayerModel> GetMainMember(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.Create())
            {
                var mainMemberId = Convert.ToInt32(RolePlayerTypeEnum.MainMemberSelf);
                var insuredLife = await _rolePlayerRepository
                    .FirstOrDefaultAsync(p =>
                        p.PolicyInsuredLives.Any(a => a.PolicyId == policyId && a.RolePlayerTypeId == mainMemberId));

                return Mapper.Map<RolePlayerModel>(insuredLife);
            }
        }

        public async Task<List<Contracts.Entities.RolePlayer.RolePlayer>> GetInsuredLifeByPolicyNumber(
            string policyNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.Create())
            {
                var insuredLives = await _rolePlayerRepository
                    .Where(p => p.PolicyInsuredLives.Any(a => a.Policy.PolicyNumber == policyNumber))
                    .Select(s => s.Person).ToListAsync();

                return Mapper.Map<List<RolePlayerModel>>(policyNumber);
            }
        }

        public async Task<List<RolePlayerModel>> GetRolePlayersByPolicyIds(List<int> policyIds,
            RolePlayerTypeEnum rolePlayerType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.Create())
            {
                var rolePlayers = await _rolePlayerRepository.Where(p =>
                    p.PolicyInsuredLives.Any(a =>
                        policyIds.Contains(a.PolicyId) && a.RolePlayerTypeId == (int)rolePlayerType)).ToListAsync();
                await _rolePlayerRepository.LoadAsync(rolePlayers, a => a.Person);

                return Mapper.Map<List<RolePlayerModel>>(rolePlayers);
            }
        }

        public async Task<List<RolePlayerModel>> GetRolePlayersByIds(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.Create())
            {
                var rolePlayers = await _rolePlayerRepository.Where(p => ids.Contains(p.RolePlayerId)).ToListAsync();
                await _rolePlayerRepository.LoadAsync(rolePlayers, a => a.Person);
                await _rolePlayerRepository.LoadAsync(rolePlayers, a => a.Company);

                return Mapper.Map<List<RolePlayerModel>>(rolePlayers);
            }
        }

        public async Task<PagedRequestResult<RolePlayerModel>> SearchRolePlayers(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = request.SearchCriteria;
                return await _rolePlayerRepository
                    .Where(rp => rp.DisplayName.Contains(filter)
                                 || (rp.Person != null && rp.Person.IdNumber.Contains(filter)))
                    .ToPagedResult<client_RolePlayer, RolePlayerModel>(request);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllInsuredLives()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var forensicPathologist = await _rolePlayerRepository
                    .Where(rolePlayer =>
                        !rolePlayer.IsDeleted && rolePlayer.PolicyInsuredLives.Any(p => p.RolePlayerTypeId == 3))
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerModel>>(forensicPathologist);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllPolicyOwners()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyOwner = await _rolePlayerRepository
                    .Where(rolePlayer =>
                        !rolePlayer.IsDeleted && rolePlayer.PolicyInsuredLives.Any(p => p.RolePlayerTypeId == 1))
                    .ToListAsync();
                await _rolePlayerRepository.LoadAsync(policyOwner, a => a.PolicyInsuredLives);
                await _rolePlayerRepository.LoadAsync(policyOwner, a => a.Company);
                return Mapper.Map<List<RolePlayerModel>>(policyOwner);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllPolicyPayees()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyPayee = await _rolePlayerRepository
                    .Where(rolePlayer =>
                        !rolePlayer.IsDeleted && rolePlayer.PolicyInsuredLives.Any(p => p.RolePlayerTypeId == 2))
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerModel>>(policyPayee);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllFinancialServiceProviders()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var financialServiceProvider = await _rolePlayerRepository
                    .Where(rolePlayer =>
                        !rolePlayer.IsDeleted && rolePlayer.PolicyInsuredLives.Any(p => p.RolePlayerTypeId == 4))
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerModel>>(financialServiceProvider);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllClaimants()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimant = await _rolePlayerRepository
                    .Where(rolePlayer =>
                        !rolePlayer.IsDeleted && rolePlayer.PolicyInsuredLives.Any(p => p.RolePlayerTypeId == 4))
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerModel>>(claimant);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllMedicalServiceProviders()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var MedicalServiceProvider = await _rolePlayerRepository
                    .Where(rolePlayer => !rolePlayer.IsDeleted && rolePlayer.HealthCareProvider != null)
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerModel>>(MedicalServiceProvider);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllFuneralParlors()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var funeralParlor = await _rolePlayerRepository
                    .Where(rolePlayer => !rolePlayer.IsDeleted && rolePlayer.FuneralParlor != null)
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerModel>>(funeralParlor);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllBodyCollectors()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var bodyCollector = await _rolePlayerRepository
                    .Where(rolePlayer => !rolePlayer.IsDeleted && rolePlayer.BodyCollector != null)
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerModel>>(bodyCollector);
            }
        }

        public async Task<List<RolePlayerModel>> GetAllUndertakers()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var undertaker = await _rolePlayerRepository
                    .Where(rolePlayer => !rolePlayer.IsDeleted && rolePlayer.Undertaker != null)
                    .ToListAsync();
                return Mapper.Map<List<RolePlayerModel>>(undertaker);
            }
        }

        #endregion
        public async Task<RolePlayerModel> GetRolePlayerForCase(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.SingleAsync(
                    s => s.RolePlayerId == rolePlayerId,
                    $"Could not find a rolePlayer with the guid {rolePlayerId}");

                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);

                if (entity.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Company)
                {
                    await _rolePlayerRepository.LoadAsync(entity, rp => rp.Company);
                }

                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerAddresses);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerBankingDetails);
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task<int> GetRolePlayerBankIdByRolePlayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _rolePlayerBankingDetailRepository
                    .Where(t => t.RolePlayerId == rolePlayerId)
                    .Select(c => c.RolePlayerBankingId).FirstOrDefaultAsync();
            }
        }

        public async Task<bool> ResubmitVOPDRequest(Person rolePlayer)
        {
            Contract.Requires(rolePlayer != null);
            var vopdMessageStatus = new VopdRequestMessage()
            {
                RolePlayerId = rolePlayer.RolePlayerId,
                IdNumber = rolePlayer.IdNumber,
                IdReferenceNo = rolePlayer.IdNumber,
                MessageId = Guid.NewGuid().ToString(),
                VerificationType = VopdVerificationType.Status
            };

            vopdMessageStatus.ImpersonateUser = SystemSettings.SystemUserAccount;
            await _quickTransactionVopdService.SubmitVOPDRequest(vopdMessageStatus);
            return true;
        }

        public async Task<int> RolePlayerVopdUpdate(VopdResponseMessage vopdMessage)
        {
            Contract.Requires(vopdMessage != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var verificationDetail = vopdMessage.VerificationDetails.FirstOrDefault();
                var message = _vopdResponseRepository.Where(a => a.IdNumber == verificationDetail.IdNumber).OrderByDescending(x => x.VopdResponseId).First();
                if (message != null && message.Reason != vopdError)
                {
                    var personDetails = await _personRepository.Where(c => c.RolePlayerId == message.RolePlayerId).FirstOrDefaultAsync();
                    if (personDetails == null)
                    {
                        return 0;
                    }

                    message.Death = verificationDetail.DateOfDeath != null;
                    message.DateOfDeath = verificationDetail.DateOfDeath ?? null;
                    message.DeceasedStatus = verificationDetail.DeceasedStatus ?? null;

                    if (verificationDetail.Surname != null && verificationDetail.Forename != null)
                    {
                        message.Identity = string.Equals(personDetails.Surname, verificationDetail.Surname, StringComparison.OrdinalIgnoreCase)
                            && string.Equals(personDetails.FirstName, verificationDetail.Forename, StringComparison.OrdinalIgnoreCase);

                        message.Firstname = verificationDetail.Forename;
                        message.Surname = verificationDetail.Surname;

                        if (!string.IsNullOrEmpty(personDetails.Surname) && string.Compare(personDetails.Surname.ToLower().Trim(), verificationDetail.Surname.ToLower().Trim()) == 0)
                        {
                            message.Identity = true;
                        }
                        else
                        {
                            message.Identity = false;
                        }
                    }

                    message.Reason = verificationDetail.ErrorMessage ?? null;
                    message.VopdStatus = VopdStatusEnum.Processed;
                    message.DateVerified = DateTime.Now;

                    _vopdResponseRepository.Update(message);

                    personDetails.IsAlive = true;

                    if (message.Death == true)
                    {
                        personDetails.DateOfDeath = Convert.ToDateTime(verificationDetail.DateOfDeath);
                        personDetails.IsAlive = false;
                    }
                    personDetails.DateVopdVerified = DateTime.Now;
                    personDetails.IsVopdVerified = true;

                    _personRepository.Update(personDetails);

                    await scope.SaveChangesAsync();
                    return message.RolePlayerId;
                }
                return 0;
            }
        }

        public async Task<int> RolePlayerVopdUpdateFromCache(int RolePlayerId, string IdNumber)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    var newRequest = _vopdResponseRepository.Where(a => a.IdNumber == IdNumber && a.VopdStatus == VopdStatusEnum.Processing).OrderByDescending(x => x.VopdResponseId).FirstOrDefault();
                    var cachedResult = _vopdResponseRepository.Where(a => a.IdNumber == IdNumber && a.VopdStatus == VopdStatusEnum.Processed).OrderByDescending(x => x.VopdResponseId).FirstOrDefault();
                    if (newRequest != null && cachedResult != null)
                    {
                        var personDetails = await _personRepository.Where(c => c.RolePlayerId == RolePlayerId).FirstOrDefaultAsync();
                        if (personDetails == null)
                        {
                            return 0;
                        }

                        newRequest.Death = cachedResult.DateOfDeath != null;
                        newRequest.DateOfDeath = cachedResult.DateOfDeath ?? null;
                        newRequest.DeceasedStatus = cachedResult.DeceasedStatus ?? null;

                        if (cachedResult.Surname != null && cachedResult.Firstname != null)
                        {

                            newRequest.Firstname = cachedResult.Firstname;
                            newRequest.Surname = cachedResult.Surname;

                            if (!string.IsNullOrEmpty(personDetails.Surname) && string.Compare(personDetails.Surname.ToLower().Trim(), cachedResult.Surname.ToLower().Trim()) == 0)
                            {
                                newRequest.Identity = true;
                            }
                            else
                            {
                                newRequest.Identity = false;
                            }
                        }

                        newRequest.Reason = cachedResult.Reason ?? null;
                        newRequest.VopdStatus = VopdStatusEnum.Processed;
                        newRequest.DateVerified = DateTime.Now;

                        _vopdResponseRepository.Update(newRequest);

                        personDetails.IsAlive = true;

                        if (newRequest.Death == true)
                        {
                            personDetails.DateOfDeath = Convert.ToDateTime(cachedResult.DateOfDeath);
                            personDetails.IsAlive = false;
                        }
                        personDetails.DateVopdVerified = DateTime.Now;
                        personDetails.IsVopdVerified = true;

                        _personRepository.Update(personDetails);

                        await scope.SaveChangesAsync();
                        return newRequest.RolePlayerId;
                    }
                    return 0;
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when reading cached VOPD results - Error Message {ex.Message}");
                return 0;
            }
        }

        public async Task PersonVopdCachedUpdate(VopdRequestMessage request)
        {
            Contract.Requires(request != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var vopdResponse = await _vopdResponseRepository
                                    .Where(a => a.IdNumber == request.IdNumber && a.VopdStatus == VopdStatusEnum.Processed)
                                    .OrderByDescending(x => x.VopdResponseId).FirstOrDefaultAsync();

                if (vopdResponse != null && vopdResponse.Reason != vopdError)
                {
                    var personDetails = await _personRepository
                                    .Where(c => c.RolePlayerId == vopdResponse.RolePlayerId).FirstOrDefaultAsync();

                    if (personDetails != null)
                    {
                        personDetails.DateVopdVerified = DateTime.Now;
                        personDetails.IsVopdVerified = true;

                        _personRepository.Update(personDetails);
                        await scope.SaveChangesAsync();
                    }
                }
            }
        }

        public async Task<string> UserVopdUpdate(VopdResponseMessage vopdMessage)
        {
            Contract.Requires(vopdMessage != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var verificationDetails = vopdMessage.VerificationDetails.FirstOrDefault();
                var message =
                    _userVopdResponseRepository.FirstOrDefault(a => a.IdNumber == verificationDetails.IdNumber);
                if (message != null)
                {
                    message.Death = vopdMessage != null &&
                                    (false || !string.IsNullOrEmpty(verificationDetails.DateOfDeath));
                    message.VopdStatus = VopdStatusEnum.Processed;
                    message.DateVerified = DateTime.Now;
                    message.Reason = !verificationDetails.DeceasedStatus.IsNullOrEmpty()
                        ? verificationDetails.DeceasedStatus
                        : verificationDetails.ErrorMessage;

                    _userVopdResponseRepository.Update(message);

                    await scope.SaveChangesAsync();
                    return message.IdNumber;
                }

                return String.Empty;
            }
        }

        public async Task<RolePlayerModel> StillBornDuplicateCheck(Person person)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            Contract.Requires(person != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var date = person.DateOfDeath.Value.ToSaDateTime();
                var entity = await _rolePlayerRepository.FirstOrDefaultAsync(a =>
                    a.Person.FirstName == person.FirstName && a.Person.Surname == person.Surname &&
                    a.Person.DateOfDeath == date);
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        private async Task<string> GetAccountNumber(RolePlayerModel mainMember)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var accountPrefix = string.Empty;

                switch (mainMember.RolePlayerIdentificationType)
                {
                    case RolePlayerIdentificationTypeEnum.Company:
                        if (mainMember.Company == null)
                            goto default;
                        accountPrefix = mainMember.Company.Name.Substring(0, 2);
                        break;

                    case RolePlayerIdentificationTypeEnum.HealthCareProvider:
                        if (mainMember.HealthCareProvider == null)
                            goto default;
                        accountPrefix = mainMember.HealthCareProvider.Name.Substring(0, 2);
                        break;

                    default:
                        accountPrefix = mainMember.DisplayName.Split(' ').Last().Substring(0, 2);
                        break;
                }

                return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.AccountNumber,
                    accountPrefix.ToUpper());
            }
        }

        private async Task<string> GetAccountNumberIndividual(RolePlayerModel mainMember)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var accountPrefix = mainMember.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Person
                    ? mainMember.DisplayName.Split(' ').Last().Substring(0, 2)
                    : mainMember.Person.Surname.Substring(0, 2);
                return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.AccountNumber,
                    accountPrefix.ToUpper());
            }
        }

        public async Task<List<AccountSearchResult>> SearchAccounts(PagedRequest request)
        {
            Contract.Requires(request != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var accounts = await _rolePlayerRepository
                    .SqlQueryAsync<AccountSearchResult>(DatabaseConstants.SearchAccounts,
                    new SqlParameter("@search", request.SearchCriteria));
                return accounts;
            }
        }

        public async Task<RolePlayerBankingDetail> GetActiveBankingDetails(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                RolePlayerBankingDetail bankingDetail = null;
                var bankDetailList = await _rolePlayerBankingDetailRepository.Where(b => b.RolePlayerId == rolePlayerId)
                    .ToListAsync();
                var entity = bankDetailList.Where(b => b.EffectiveDate <= DateTimeHelper.SaNow)
                    .OrderByDescending(r => r.EffectiveDate).FirstOrDefault();
                if (entity != null)
                {
                    bankingDetail = Mapper.Map<RolePlayerBankingDetail>(entity);

                    var bankBranch = await _bankBranchService.GetBankBranch(entity.BankBranchId);
                    bankingDetail.BankName = bankBranch.Bank.Name;
                    bankingDetail.BankBranchName = bankBranch.Name;
                }

                return bankingDetail;
            }
        }

        public async Task<FinPayee> GetFinPayee(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var finPayee = await _finPayeeRepository.FirstOrDefaultAsync(c => c.RolePlayerId == rolePlayerId);
                return Mapper.Map<FinPayee>(finPayee);
            }
        }

        public async Task UpdateRolePlayer(RolePlayerModel roleplayer)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRolePlayer);

            Contract.Requires(roleplayer != null);

            await EditRolePlayer(roleplayer);
        }

        public async Task<FinPayee> GetFinPayeeByFinpayeNumber(string finPayeNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var finPayee = await _finPayeeRepository.FirstOrDefaultAsync(c => c.FinPayeNumber == finPayeNumber);
                return Mapper.Map<FinPayee>(finPayee);
            }
        }

        public async Task<List<DebtorSearchResult>> SearchForFinPayees(string query)
        {
            var results = new List<DebtorSearchResult>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                results = await _rolePlayerRepository.SqlQueryAsync<DebtorSearchResult>(DatabaseConstants.SearchDebtors,
                    new SqlParameter("@searchText", query));
                return results;
            }
        }

        public async Task<ClientVopdResponse> GetVOPDResponseResultByRoleplayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var vopdResponses =
                    await _vopdResponseRepository.OrderByDescending(b => b.SubmittedDate).FirstOrDefaultAsync(a => a.RolePlayerId == rolePlayerId);
                return Mapper.Map<ClientVopdResponse>(vopdResponses);
            }
        }

        public async Task<ClientVopdResponse> GetVOPDResponseResultByRoleplayerIdAndIdNumber(int rolePlayerId, string IdNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var vopdResponses = await _vopdResponseRepository
                    .Where(a => a.IdNumber == IdNumber && a.RolePlayerId == rolePlayerId)
                    .OrderByDescending(x => x.VopdResponseId)
                    .FirstOrDefaultAsync();

                if (vopdResponses == null)
                {
                    return null;  // Handle null case appropriately
                }

                return Mapper.Map<ClientVopdResponse>(vopdResponses);
            }
        }

        public async Task UpdateClientVopdResponse(ClientVopdResponse clientVopdResponse)
        {
            Contract.Requires(clientVopdResponse != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var vopdResponse = await _vopdResponseRepository.OrderByDescending(x => x.VopdResponseId).FirstOrDefaultAsync(a => a.RolePlayerId == clientVopdResponse.RolePlayerId && a.IdNumber == clientVopdResponse.IdNumber);

                vopdResponse.VopdStatus = clientVopdResponse.VopdStatus;
                vopdResponse.ResubmittedDate = clientVopdResponse.ResubmittedDate;
                _vopdResponseRepository.Update(vopdResponse);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
            }
        }

        public async Task<RolePlayerModel> GetPolicyOwnerByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(p => p.Policies_PolicyOwnerId.Any(a => a.PolicyId == policyId));
                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Company);
                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.FinPayee);
                return Mapper.Map<RolePlayerModel>(rolePlayer);
            }
        }

        public async Task<int> CreateOnlyRolePlayer(RolePlayerModel rolePlayer)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRolePlayer);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var member = Mapper.Map<client_RolePlayer>(rolePlayer);
                var idExists = true;
                while (idExists)
                {
                    member.RolePlayerId =
                        await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                    idExists = _rolePlayerRepository.Any(a => a.RolePlayerId == member.RolePlayerId);
                }

                member.DisplayName = $"{member.Person.FirstName} {member.Person.Surname}".Trim();
                member.Person.RolePlayerId = member.RolePlayerId;
                if (member.Person.IdType != IdTypeEnum.SAIDDocument)
                {
                    member.Person.IdNumber = FixIdentificationNumber(member.RolePlayerId, member.Person.IdNumber);
                }

                member.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                member.IsDeleted = false;

                _rolePlayerRepository.Create(member);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                await _auditWriter.AddLastViewed<client_RolePlayer>(member.RolePlayerId);

                return member.RolePlayerId;
            }
        }

        public async Task<FinPayee> GetClaimRecoveryDebtorByBankStatementReference(string userReference)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResults = await _finPayeeRepository.SqlQueryAsync<FinPayee>(
                    DatabaseConstants.SearchForClaimRecoveryDebtorByBankStatementReference,
                    new SqlParameter("StatementReference", userReference));
                return searchResults.Count > 0 ? searchResults[0] : null;
            }
        }

        public async Task<Company> GetCompanyByReferenceNumber(string referenceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return Mapper.Map<Company>(
                    await _companyRepository.FirstOrDefaultAsync(s => s.ReferenceNumber == referenceNumber));
            }
        }

        public async Task<RolePlayerModel> GetPerson(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.FirstOrDefaultAsync(
                    s => s.RolePlayerId == rolePlayerId);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task<RolePlayerModel> GetPersonRolePlayerRelations(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.FirstOrDefaultAsync(
                    s => s.RolePlayerId == rolePlayerId);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerRelations_ToRolePlayerId);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerRelations_FromRolePlayerId);
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task<RolePlayerModel> GetCompany(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.FirstOrDefaultAsync(
                    s => s.RolePlayerId == rolePlayerId);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Company);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.FinPayee);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerAddresses);
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task<string> GetDebtorIndustryClassBankAccountNumber(string finPayeNumber)
        {
            var debtor = await GetFinPayeeByFinpayeNumber(finPayeNumber);

            var fromDebtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);

            var debtorPolicies = await
                _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(debtor.RolePlayerId);

            if (debtorPolicies.Count == 0)
            {
                return string.Empty;
            }

            ProductBankAccount productBankAccount = null;

            foreach (var policy in debtorPolicies)
            {
                var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                productBankAccount = product.ProductBankAccounts.Find(p =>
                    p.IndustryClass == fromDebtorIndustry.IndustryClass);
                if (productBankAccount != null)
                {
                    break;
                }
            }

            if (productBankAccount == null)
            {
                return string.Empty;
            }

            var bankAccount = await _bankAccountService.GetBankAccountByAccountNumber(
                productBankAccount.BankAccountId);
            return bankAccount.AccountNumber;
        }

        public async Task<FinPayee> GetFinPayeeByRolePlayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var finPayee = await _finPayeeRepository.FirstOrDefaultAsync(c => c.RolePlayerId == rolePlayerId);
                return Mapper.Map<FinPayee>(finPayee);
            }
        }

        public async Task<BankAccount> GetDebtorIndustryClassBankAccount(string finPayeNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBankAccount);

            var debtor = await GetFinPayeeByFinpayeNumber(finPayeNumber);

            var fromDebtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);

            var debtorPolicies = await
                _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(debtor.RolePlayerId);

            if (debtorPolicies.Count == 0)
            {
                return null;
            }

            ProductBankAccount productBankAccount = null;

            foreach (var policy in debtorPolicies)
            {
                var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                productBankAccount = product.ProductBankAccounts.Find(p =>
                    p.IndustryClass == fromDebtorIndustry.IndustryClass);
                if (productBankAccount != null)
                {
                    break;
                }
            }

            if (productBankAccount == null)
            {
                return null;
            }

            return await _bankAccountService.GetBankAccountByAccountNumber(productBankAccount.BankAccountId);
        }

        public async Task<List<UserVopdResponse>> GetProcessedUserVopdResponse()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var processedVopdResponses = await _userVopdResponseRepository
                    .Where(a => a.VopdStatus == VopdStatusEnum.Processed && a.IsProcessed == false).ToListAsync();
                return Mapper.Map<List<UserVopdResponse>>(processedVopdResponses);
            }
        }

        public async Task UpdateUserVopdIsProcessed(UserVopdResponse userVopdResponse)
        {
            Contract.Requires(userVopdResponse != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = await _userVopdResponseRepository.Where(a => a.IdNumber == userVopdResponse.IdNumber)
                    .FirstOrDefaultAsync();
                entity.IsProcessed = userVopdResponse.IsProcessed;
                _userVopdResponseRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UpdatePerson(Person person)
        {
            Contract.Requires(person != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = await _personRepository.Where(a => a.RolePlayerId == person.RolePlayerId)
                    .FirstOrDefaultAsync();
                entity.Surname = person.Surname;
                _personRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PreviousInsurerRolePlayer> GetPreviousInsurerRolePlayer(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _previousInsurerRolePlayerRepository.Where(s => s.RolePlayerId == rolePlayerId)
                    .OrderBy(s => s.Id).FirstOrDefaultAsync();
                if (entity != null)
                {
                    await _previousInsurerRolePlayerRepository.LoadAsync(entity, rp => rp.PreviousInsurer);
                    return Mapper.Map<PreviousInsurerRolePlayer>(entity);
                }
                else
                {
                    return null;
                }
            }
        }

        public async Task<UserVopdResponse> GetUserVopdResponseMessage(string idNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var processedVopdResponses =
                    await _userVopdResponseRepository.FirstOrDefaultAsync(a => a.IdNumber == idNumber);
                if (processedVopdResponses != null)
                {
                    return Mapper.Map<UserVopdResponse>(processedVopdResponses);
                }

                return new UserVopdResponse();
            }
        }

        public async Task<RolePlayerModel> GetMemberPortalPolicyRolePlayer(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.FirstAsync(
                    s => s.RolePlayerId == rolePlayerId);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerAddresses);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerBankingDetails);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Company);
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task<int> CheckIfRolePlayerExists(string idNumber)
        {
            if (idNumber != null)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var rolePlayer = await _personRepository.FirstOrDefaultAsync(a => a.IdNumber == idNumber);
                    return rolePlayer != null ? rolePlayer.RolePlayerId : 0;
                }
            }

            return 0;
        }

        public async Task<bool> RolePlayerExists(int roleplayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(a => a.RolePlayerId == roleplayerId);
                return rolePlayer != null;
            }
        }

        public async Task<List<Company>> GetCompaniesByNameOrNumber(string searchCriteria)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayers = await _rolePlayerRepository
                    .Where(rp => rp.DisplayName.Contains(searchCriteria))
                    .Select(t => t.RolePlayerId)
                    .ToListAsync();

                var finPayees = await _finPayeeRepository
                    .Where(fp => fp.FinPayeNumber.Contains(searchCriteria))
                    .Select(t => t.RolePlayerId)
                    .ToListAsync();

                var newList = rolePlayers.Union(finPayees);

                var memberList = await _companyRepository
                    .Where(c =>
                        c.CompanyLevel == CompanyLevelEnum.HoldingCompany &&
                        (newList.Contains(c.RolePlayerId) ||
                         c.IdNumber.Contains(searchCriteria) ||
                         c.ReferenceNumber.Contains(searchCriteria)))
                    .ToListAsync();

                return Mapper.Map<List<Company>>(memberList);
            }
        }

        public async Task<List<RolePlayerBankingDetail>> GetBankingDetailsByAccountNumber(string accountNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var results = await _rolePlayerBankingDetailRepository.Where(b => b.AccountNumber.Equals(accountNumber))
                    .ToListAsync();
                var rolePlayerBankingDetails = Mapper.Map<List<RolePlayerBankingDetail>>(results);

                foreach (var rolePlayerBankingDetail in rolePlayerBankingDetails)
                {
                    var bankBranch = await _bankBranchService.GetBankBranch(rolePlayerBankingDetail.BankBranchId);
                    rolePlayerBankingDetail.BankName = bankBranch.Bank.Name;
                }

                return rolePlayerBankingDetails;
            }
        }

        public async Task<List<RolePlayerContact>> GetRolePlayerContactDetails(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFfl) &&
                RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRolePlayer);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _rolePlayerContactRepository.Where(b => b.RolePlayerId == rolePlayerId)
                    .ToListAsync();
                await _rolePlayerContactRepository.LoadAsync(results, rp => rp.RolePlayerContactInformations);
                return Mapper.Map<List<RolePlayerContact>>(results);
            }
        }

        public async Task<int> CreateRolePlayerContactDetails(RolePlayerContact rolePlayerContact)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_RolePlayerContact>(rolePlayerContact);
                _rolePlayerContactRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerContactId;
            }
        }

        public async Task<int> EditRolePlayerContactDetails(RolePlayerContact rolePlayerContact)
        {
            Contract.Requires(rolePlayerContact != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _rolePlayerContactRepository.FirstOrDefaultAsync(rpc =>
                    rpc.RolePlayerContactId == rolePlayerContact.RolePlayerContactId);
                entity.CommunicationType = rolePlayerContact.CommunicationType;
                entity.ContactDesignationType = rolePlayerContact.ContactDesignationType;
                entity.Title = rolePlayerContact.Title;
                entity.Firstname = rolePlayerContact.Firstname;
                entity.Surname = rolePlayerContact.Surname;
                entity.TelephoneNumber = rolePlayerContact.TelephoneNumber;
                entity.ContactNumber = rolePlayerContact.ContactNumber;
                entity.EmailAddress = rolePlayerContact.EmailAddress;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTime.Now;
                entity.IsConfirmed = rolePlayerContact.IsConfirmed;
                entity.RolePlayerContactInformations = Mapper.Map<List<client_RolePlayerContactInformation>>(rolePlayerContact.RolePlayerContactInformations);
                _rolePlayerContactRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerContactId;
            }
        }

        public async Task<int> CreateFuneralParlor(FuneralParlor funeralParlor)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_FuneralParlor>(funeralParlor);
                _funeralParlorRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerId;
            }

        }

        public async Task<int> CreateUndertaker(Undertaker undertaker)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_Undertaker>(undertaker);
                _undertakerRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerId;
            }
        }

        public async Task<int> CreateBodyCollector(BodyCollector bodyCollector)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_BodyCollector>(bodyCollector);
                _bodyCollectorRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerId;
            }
        }

        public async Task<int> UpdateFuneralParlor(FuneralParlor funeralParlor)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_FuneralParlor>(funeralParlor);
                _funeralParlorRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerId;
            }
        }

        public async Task<int> UpdateUndertaker(Undertaker undertaker)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_Undertaker>(undertaker);
                _undertakerRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerId;
            }
        }

        public async Task<int> UpdateBodyCollector(BodyCollector bodyCollector)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_BodyCollector>(bodyCollector);
                _bodyCollectorRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.RolePlayerId;
            }
        }

        public async Task<int> CreatePersonEmployment(PersonEmployment personEmployment)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<client_PersonEmployment>(personEmployment);
                _personEmployment.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.PersonEmpoymentId;
            }
        }

        public async Task<int> EditPersonEmployment(PersonEmployment personEmployment)
        {
            Contract.Requires(personEmployment != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _personEmployment.FirstOrDefaultAsync(a => a.PersonEmpoymentId == personEmployment.PersonEmpoymentId);
                entity.EmployeeRolePlayerId = personEmployment.EmployeeRolePlayerId;
                entity.EmployerRolePlayerId = personEmployment.EmployerRolePlayerId;
                entity.IsSkilled = personEmployment.IsSkilled;
                entity.IsTraineeLearnerApprentice = personEmployment.IsTraineeLearnerApprentice;
                entity.YearsInIndustry = personEmployment.YearsInIndustry;
                entity.YearsInPresentOccupation = personEmployment.YearsInPresentOccupation;
                entity.StartDate = personEmployment.StartDate;
                entity.PatersonGradingId = personEmployment.PatersonGradingId;
                entity.EmployeeNumber = personEmployment.EmployeeNumber;
                entity.EmployeeIndustryNumber = personEmployment.EmployeeIndustryNumber;
                entity.RmaEmployeeRefNum = personEmployment.RmaEmployeeRefNum;
                entity.DesignationTypeId = personEmployment.DesignationTypeId;
                _personEmployment.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.PersonEmpoymentId;
            }

        }

        public async Task<PersonEmployment> GetPersonEmploymentByPersonEmploymentId(int personEmploymentId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _personEmployment.FirstOrDefaultAsync(pe => pe.PersonEmpoymentId == personEmploymentId);
                return Mapper.Map<PersonEmployment>(entity);
            }
        }

        public async Task<PersonEmployment> GetPersonEmployment(int personEmployeeId, int personEmployerId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _personEmployment.OrderByDescending(r => r.PersonEmpoymentId).FirstOrDefaultAsync(pe =>
                    pe.EmployeeRolePlayerId == personEmployeeId && pe.EmployerRolePlayerId == personEmployerId &&
                    pe.EndDate == null);
                if (entity != null)
                    return Mapper.Map<PersonEmployment>(entity);
                else
                    return Mapper.Map<PersonEmployment>(new client_PersonEmployment());
            }

        }

        public async Task<PersonEmployment> GetPersonEmploymentByIndustryNumber(string industryNumber)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _personEmployment.FirstOrDefaultAsync(pe =>
                    pe.EmployeeIndustryNumber == industryNumber);
                if (entity != null)
                    return Mapper.Map<PersonEmployment>(entity);
                else
                    return Mapper.Map<PersonEmployment>(new client_PersonEmployment());
            }

        }

        public async Task<List<Company>> GetCoidCompaniesByNameOrNumber(string searchCriteria)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayers = await _rolePlayerRepository
                    .Where(rp => rp.DisplayName.Contains(searchCriteria))
                    .Select(t => t.RolePlayerId)
                    .ToListAsync();

                var finPayees = await _finPayeeRepository
                    .Where(fp => fp.FinPayeNumber.Contains(searchCriteria))
                    .Select(t => t.RolePlayerId)
                    .ToListAsync();

                var newList = rolePlayers.Union(finPayees);

                var memberList = await _companyRepository
                    .Where(c =>
                        (newList.Contains(c.RolePlayerId) ||
                         c.IdNumber.Contains(searchCriteria) ||
                         c.ReferenceNumber.Contains(searchCriteria)))
                    .ToListAsync();

                return Mapper.Map<List<Company>>(memberList);
            }
        }

        public async Task<int> GetRolePlayerPolicyCount(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = await _policyRepository
                    .Where(p => p.PolicyPayeeId == rolePlayerId)
                    .ToListAsync();
                return policies.Count;
            }
        }

        public async Task<IndustryClassEnum> GetDebtorIndustryClass(string finPayeNumber)
        {
            var debtor = await GetFinPayeeByFinpayeNumber(finPayeNumber);

            var industry = await _industryService.GetIndustry(debtor.IndustryId);

            return industry.IndustryClass;
        }

        public async Task<Company> GetCompanyByRolePlayer(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return Mapper.Map<Company>(
                    await _companyRepository.FirstOrDefaultAsync(s => s.RolePlayerId == rolePlayerId));
            }
        }

        public async Task<RolePlayerModel> GetRolePlayerPersonalDetails(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.SingleAsync(
                    s => s.RolePlayerId == rolePlayerId,
                    $"Could not find a rolePlayer with the id {rolePlayerId}");
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.RolePlayerAddresses);
                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task<List<FinPayee>> GetDebtorsByBankStatementReference(string userReference)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResults = await _finPayeeRepository.SqlQueryAsync<FinPayee>(
                    DatabaseConstants.SearchMultipleDebtorsByBankStatementReference,
                    new SqlParameter("StatementReference", userReference));
                return searchResults.Count > 0 ? searchResults : null;
            }
        }

        public async Task<FinPayee> GetFinPayeeAccountByFinPayeeNumber(string finPayeeNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var account = await _finPayeeRepository
                    .SingleOrDefaultAsync(s => s.FinPayeNumber == finPayeeNumber);
                if (account == null) return null;
                return Mapper.Map<FinPayee>(account);
            }
        }

        public async Task<RolePlayerModel> GetRolePlayerByIdentificationType(RolePlayerIdentificationTypeEnum rolePlayerIdentificationType, string identificationNumber)
        {
            var rolePlayer = new client_RolePlayer()
            {
                Person = null,
                Company = null,
                HealthCareProvider = null
            };

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                switch (rolePlayerIdentificationType)
                {
                    case RolePlayerIdentificationTypeEnum.Company:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a => a.Company != null
                        && (a.Company.VatRegistrationNo == identificationNumber
                        || a.Company.ReferenceNumber == identificationNumber
                        || a.Company.CompensationFundReferenceNumber == identificationNumber));
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Company);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.FinPayee);
                        }
                        break;

                    case RolePlayerIdentificationTypeEnum.HealthCareProvider:
                        var hcp = await _healthCareProviderService.SearchHealthCareProviderByPracticeNumber(identificationNumber);
                        if (hcp != null)
                        {
                            rolePlayer = _rolePlayerRepository.FirstOrDefault(a => a.RolePlayerId == hcp.RolePlayerId);
                            if (rolePlayer != null)
                            {
                                //TO DO: Ajay to move HealthCareProvider table to client schema
                                // and load healthcareprovide async instead of manual mapping as per below implementation
                                //await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.HealthCareProvider);

                                rolePlayer.HealthCareProvider = MapHealthCareProviderToMedicalServiceProvider(hcp);
                                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.FinPayee);
                            }
                        }
                        break;

                    default:
                        rolePlayer = _rolePlayerRepository.FirstOrDefault(a => a.Person != null && a.Person.IdNumber == identificationNumber);
                        if (rolePlayer != null)
                        {
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                            await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.FinPayee);
                        }
                        break;
                }

                return Mapper.Map<RolePlayerModel>(rolePlayer);
            }
        }

        public async Task<RolePlayerModel> CreateRolePlayerProfile(RolePlayerModel rolePlayer)
        {
            Contract.Requires(rolePlayer != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                rolePlayer.RolePlayerId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                if (rolePlayer.FinPayee != null && string.IsNullOrEmpty(rolePlayer.FinPayee.FinPayeNumber))
                {
                    rolePlayer.FinPayee.FinPayeNumber = await GetAccountNumber(rolePlayer);
                }

                var clientRolePlayer = Mapper.Map<client_RolePlayer>(rolePlayer);
                rolePlayer = Mapper.Map<RolePlayerModel>(clientRolePlayer);

                _rolePlayerRepository.Create(clientRolePlayer);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                rolePlayer = await GetRolePlayerProfile(rolePlayer.RolePlayerId);
            }
            return await Task.FromResult(rolePlayer);
        }

        private medical_HealthCareProvider MapHealthCareProviderToMedicalServiceProvider(MediCare.Contracts.Entities.Medical.HealthCareProvider hcp)
        {
            return new medical_HealthCareProvider()
            {
                RolePlayerId = hcp.RolePlayerId,
                Name = hcp.Name,
                Description = hcp.Description,
                PracticeNumber = hcp.PracticeNumber,
                DatePracticeStarted = hcp.DatePracticeStarted.Value,
                DatePracticeClosed = hcp.DatePracticeClosed,
                ProviderTypeId = hcp.ProviderTypeId,
                VatRegNumber = hcp.VatRegNumber,
                ConsultingPartnerType = hcp.ConsultingPartnerType,
                IsPreferred = hcp.IsPreferred,
                DispensingLicenseNo = hcp.DispensingLicenseNo,
                IsAuthorised = hcp.IsAuthorised.Value
            };
        }

        private async Task<RolePlayerModel> GetRolePlayerProfile(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerRepository.SingleAsync(
                    s => s.RolePlayerId == rolePlayerId,
                    $"Could not find a rolePlayer with the id {rolePlayerId}");

                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.HealthCareProvider);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.Company);
                await _rolePlayerRepository.LoadAsync(entity, rp => rp.FinPayee);

                return Mapper.Map<RolePlayerModel>(entity);
            }
        }

        public async Task SaveBeneficiaries(int mainMemberId, List<RolePlayerModel> beneficiaries,
            List<RolePlayerModel> roleplayers)
        {
            if (roleplayers == null) return;
            if (roleplayers.Count == 0) return;
            foreach (var roleplayer in roleplayers)
            {
                if (beneficiaries != null)
                {
                    var idx = beneficiaries
                        .FindIndex(b =>
                            b.Person.IdNumber.Equals(roleplayer.Person.IdNumber, StringComparison.OrdinalIgnoreCase));

                    if (idx >= 0)
                    {
                        roleplayer.FromRolePlayers.Add(
                            new RolePlayerRelation
                            {
                                Id = 0,
                                FromRolePlayerId = 0,
                                ToRolePlayerId = mainMemberId,
                                RolePlayerTypeId = (int)RolePlayerTypeEnum.Beneficiary
                            }
                        );

                        beneficiaries.RemoveAt(idx);
                    }
                }

                foreach (var relation in roleplayer.FromRolePlayers)
                {
                    relation.ToRolePlayerId = mainMemberId;
                }

                await SaveRolePlayerBeneficiaries(roleplayer);
            }
        }

        public async Task SaveBeneficiary(int mainMemberId, RolePlayerModel roleplayer)
        {
            if (roleplayer == null) return;

            foreach (var relation in roleplayer.FromRolePlayers)
            {
                relation.ToRolePlayerId = mainMemberId;
            }

            await SaveRolePlayerBeneficiaries(roleplayer);
        }

        public async Task<int> SaveRolePlayerBeneficiaries(RolePlayerModel roleplayer)
        {
            Contract.Requires(roleplayer != null);

            var rolePlayerUpdatedId = 0;
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.JoinExisting))
            {
                var data = await _rolePlayerRepository
                    .FirstOrDefaultAsync(r =>
                        r.Person.IdNumber.Equals(roleplayer.Person.IdNumber, StringComparison.OrdinalIgnoreCase));

                var newRolePlayer = data == null;
                if (newRolePlayer)
                {
                    roleplayer.RolePlayerBankingDetails?.ForEach(
                        detail => detail.PurposeId = detail.PurposeId == 0 ? 1 : detail.PurposeId
                    );
                    var rolePlayerId =
                        await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);

                    roleplayer.FromRolePlayers?.ForEach(
                       relation => relation.FromRolePlayerId = rolePlayerId
                    );

                    roleplayer.RolePlayerId = rolePlayerId;
                    roleplayer.BodyCollector = null;
                    roleplayer.ForensicPathologist = null;
                    roleplayer.FuneralParlor = null;
                    roleplayer.Informant = null;
                    roleplayer.HealthCareProvider = null;
                    roleplayer.Undertaker = null;
                    roleplayer.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                    roleplayer.IsDeleted = false;
                    roleplayer.Person.RolePlayerId = rolePlayerId;
                    if (roleplayer.Person.IdType != IdTypeEnum.SAIDDocument)
                    {
                        roleplayer.Person.IdNumber = FixIdentificationNumber(rolePlayerId, roleplayer.Person.IdNumber);
                    }

                    roleplayer.Person.DateOfBirth = roleplayer.Person.DateOfBirth.ToSaDateTime();

                    var entity = Mapper.Map<client_RolePlayer>(roleplayer);
                    entity.Person.Title = roleplayer.Person.Title;
                    _rolePlayerRepository.Create(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    rolePlayerUpdatedId = rolePlayerId;
                    if (roleplayer.Person.IdType == IdTypeEnum.SAIDDocument)
                    {
                        await RolePlayerVopdMultipleRequest(roleplayer.Person);
                    }
                }
                else
                {
                    await _rolePlayerRepository.LoadAsync(data, rp => rp.Person);
                    await _rolePlayerRepository.LoadAsync(data, rp => rp.RolePlayerRelations_FromRolePlayerId);
                    data.DisplayName = roleplayer.DisplayName;
                    data.TellNumber = roleplayer.TellNumber;
                    data.CellNumber = roleplayer.CellNumber;
                    data.EmailAddress = roleplayer.EmailAddress;
                    data.PreferredCommunicationTypeId = roleplayer.PreferredCommunicationTypeId;
                    data.RolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
                    data.IsDeleted = false;
                    data.Person.FirstName = roleplayer.Person.FirstName;
                    data.Person.Surname = roleplayer.Person.Surname;
                    data.Person.DateOfBirth = roleplayer.Person.DateOfBirth.ToSaDateTime();
                    data.Person.IsStudying = roleplayer.Person.IsStudying;
                    data.Person.IsDisabled = roleplayer.Person.IsDisabled;
                    data.Person.IsDeleted = false;
                    data.Person.Title = roleplayer.Person.Title;
                    data.Person.CountryOriginId = roleplayer.Person.CountryOriginId;
                    data.Person.ProvinceId = roleplayer.Person.ProvinceId;

                    foreach (var relation in roleplayer.FromRolePlayers)
                    {
                        relation.FromRolePlayerId = data.RolePlayerId;
                        var itemEntity = Mapper.Map<client_RolePlayerRelation>(relation);
                        data.RolePlayerRelations_FromRolePlayerId.Add(itemEntity);
                    }

                    if (roleplayer.RolePlayerAddresses != null)
                    {
                        data.RolePlayerAddresses = null;
                        data.RolePlayerAddresses = new List<client_RolePlayerAddress>();
                        foreach (var address in roleplayer.RolePlayerAddresses)
                        {
                            var mappedAddress = Mapper.Map<client_RolePlayerAddress>(address);
                            mappedAddress.RolePlayerId = data.RolePlayerId;
                            if (mappedAddress.CountryId < 1)
                            {
                                mappedAddress.CountryId = 1; // defaults to South Africa
                            }

                            data.RolePlayerAddresses.Add(mappedAddress);
                        }
                    }

                    if (roleplayer.RolePlayerBankingDetails?.Count > 0)
                    {
                        data.RolePlayerBankingDetails = null;
                        data.RolePlayerBankingDetails = new List<client_RolePlayerBankingDetail>();
                        foreach (var banking in roleplayer.RolePlayerBankingDetails)
                        {
                            banking.PurposeId = banking.PurposeId != 0 ? banking.PurposeId : 1;

                            var mappedBanking = Mapper.Map<client_RolePlayerBankingDetail>(banking);
                            mappedBanking.RolePlayerId = data.RolePlayerId;
                            mappedBanking.PurposeId = 1; // collections
                            data.RolePlayerBankingDetails.Add(mappedBanking);
                        }
                    }

                    _rolePlayerRepository.Update(data);
                    var rolePlayerId = data.RolePlayerId;
                    rolePlayerUpdatedId = rolePlayerId;
                    roleplayer.RolePlayerId = rolePlayerId;
                    roleplayer.Person.RolePlayerId = rolePlayerId;
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    if (roleplayer.Person.IdType == IdTypeEnum.SAIDDocument)
                    {
                        await RolePlayerVopdMultipleRequest(roleplayer.Person);
                    }
                }
            }
            return rolePlayerUpdatedId;
        }

        public async Task<RolePlayerBankingDetail> GetBankingDetailsForSTPIntegration(int rolePlayerId, int rolePlayerTypeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                const int compCareMSPOwnerTypeId = 3;
                int rolePlayerType = (rolePlayerTypeId == (int)RolePlayerTypeEnum.MedicalServiceProvider) ? rolePlayerTypeId : compCareMSPOwnerTypeId;
                SqlParameter[] parameters = {
                    new SqlParameter("OwnerID", rolePlayerId),
                    new SqlParameter("OwnerType", rolePlayerType)
                };

                var medicalInvoiceClaimQuery =
                    await _rolePlayerBankingDetailRepository.SqlQueryAsync<RolePlayerBankingDetail>(DatabaseConstants.GetBankingDetailsValidationsSTPIntegrationStoredProcedure, parameters);
                return medicalInvoiceClaimQuery.FirstOrDefault();
            }
        }

        public async Task ProcessVopdUpdateResponse(VopdUpdateResponseModel vopdUpdateResponseModel)
        {
            Contract.Requires(vopdUpdateResponseModel != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var person = await _personRepository.FirstOrDefaultAsync(a => a.IdNumber == vopdUpdateResponseModel.IdNumber);
                if (person == null) return;

                person.DateOfDeath = vopdUpdateResponseModel.DateOfDeath;
                person.IsAlive = vopdUpdateResponseModel.DeceasedStatus == "ALIVE";
                person.DateVopdVerified = vopdUpdateResponseModel.VopdDatetime;
                person.IsVopdVerified = true;
                person.ModifiedBy = vopdUpdateResponseModel.ModifiedBy;

                _personRepository.Update(person);

                await _rolePlayerNoteService.AddNote(new Common.Entities.Note()
                {
                    ItemId = person.RolePlayerId,
                    Text = $"{vopdUpdateResponseModel.FirstName}|{vopdUpdateResponseModel.Surname}|{vopdUpdateResponseModel.IdNumber} updated by {vopdUpdateResponseModel.ModifiedBy}",
                    CreatedBy = vopdUpdateResponseModel.ModifiedBy,
                    ModifiedBy = vopdUpdateResponseModel.ModifiedBy

                });

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task ProcessRolePlayerBatchInfoUpdate(RolePlayerBatchInfoUpdate rolePlayerBatchInfoUpdate)
        {
            Contract.Requires(rolePlayerBatchInfoUpdate != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var batchId = new SqlParameter { ParameterName = "@batchId", Value = rolePlayerBatchInfoUpdate.BatchId };
                await _policyRepository.ExecuteSqlCommandAsync("[onboarding].[RolePlayerBatchInfoUpdate] @batchId", batchId);
            }
        }

        public async Task<PagedRequestResult<RolePlayerContact>> GetPagedRolePlayerContacts(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = Convert.ToInt32(pagedRequest.SearchCriteria);
                var rolePlayerContacts = await _rolePlayerContactRepository.Where(r => r.RolePlayerId == filter)
                    .ToPagedResult(pagedRequest);
                await _rolePlayerContactRepository.LoadAsync(rolePlayerContacts.Data, p => p.RolePlayerContactInformations);

                var result = Mapper.Map<PagedRequestResult<RolePlayerContact>>(rolePlayerContacts);

                return new PagedRequestResult<RolePlayerContact>()
                {
                    Page = pagedRequest.Page,
                    PageCount = rolePlayerContacts.PageCount,
                    RowCount = rolePlayerContacts.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result.Data
                };
            }
        }

        public async Task<PagedRequestResult<RolePlayerModel>> GetPagedBeneficiaries(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = Convert.ToInt32(pagedRequest.SearchCriteria);
                var relatedRolePlayers = await _rolePlayerRelationRepository.Where(r => r.ToRolePlayerId == filter).Select(r => r.FromRolePlayerId).ToListAsync();
                var injuredPerson = await _rolePlayerRepository.Where(r => relatedRolePlayers.Contains(r.RolePlayerId)).ToPagedResult(pagedRequest);
                await _rolePlayerRepository.LoadAsync(injuredPerson.Data, rp => rp.RolePlayerRelations_ToRolePlayerId);
                await _rolePlayerRepository.LoadAsync(injuredPerson.Data, rp => rp.RolePlayerRelations_FromRolePlayerId);

                if (injuredPerson.Data.Count != 0)
                {
                    List<client_RolePlayer> beneficiariesToAdd = new List<client_RolePlayer>();
                    foreach (var rolePlayer in injuredPerson.Data)
                    {
                        foreach (var rolePlayerRelation in rolePlayer.RolePlayerRelations_FromRolePlayerId)
                        {
                            var beneficiary = await _rolePlayerRepository.FirstOrDefaultAsync(r => r.RolePlayerId == rolePlayerRelation.FromRolePlayerId);
                            await _rolePlayerRepository.LoadAsync(beneficiary, b => b.Person);

                            beneficiariesToAdd.Add(beneficiary);
                        }
                    }
                    // Remove elements with a null Person property
                    injuredPerson.Data.RemoveAll(x => x.Person == null);
                }
                else
                {
                    injuredPerson.Data.RemoveAll(x => x.Person == null);
                }

                var result = Mapper.Map<PagedRequestResult<RolePlayerModel>>(injuredPerson);

                return new PagedRequestResult<RolePlayerModel>()
                {
                    Page = pagedRequest.Page,
                    PageCount = injuredPerson.PageCount,
                    RowCount = injuredPerson.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result.Data
                };
            }
        }

        public async Task<RolePlayerModel> GetBeneficiary(int beneficiaryId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(a => a.RolePlayerId == beneficiaryId);
                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.RolePlayerAddresses);
                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.RolePlayerRelations_ToRolePlayerId);
                await _rolePlayerRepository.LoadAsync(rolePlayer, rp => rp.RolePlayerRelations_FromRolePlayerId);

                var result = Mapper.Map<RolePlayerModel>(rolePlayer);

                return result;
            }
        }

        public async Task<PagedRequestResult<RolePlayerAddress>> GetPagedRolePlayerAddress(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = Convert.ToInt32(pagedRequest.SearchCriteria);
                var rolePlayers = await _rolePlayerAddressRepository.OrderByDescending(r => r.RolePlayerAddressId)
                    .ThenByDescending(o => o.AddressType)
                    .Where(r => r.RolePlayerId == filter)
                    .ToPagedResult(pagedRequest);

                var result = Mapper.Map<PagedRequestResult<RolePlayerAddress>>(rolePlayers);

                return new PagedRequestResult<RolePlayerAddress>()
                {
                    Page = pagedRequest.Page,
                    PageCount = rolePlayers.PageCount,
                    RowCount = rolePlayers.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result.Data
                };
            }
        }

        public async Task<PagedRequestResult<RolePlayerBankingDetail>> GetPagedRolePlayerBankingDetails(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = Convert.ToInt32(pagedRequest.SearchCriteria);
                var rolePlayers = await _rolePlayerBankingDetailRepository.OrderByDescending(r => r.RolePlayerBankingId)
                    .ThenByDescending(o => o.BankAccountType)
                    .Where(r => r.RolePlayerId == filter)
                    .ToPagedResult(pagedRequest);

                var result = Mapper.Map<PagedRequestResult<RolePlayerBankingDetail>>(rolePlayers);

                return new PagedRequestResult<RolePlayerBankingDetail>()
                {
                    Page = pagedRequest.Page,
                    PageCount = rolePlayers.PageCount,
                    RowCount = rolePlayers.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result.Data
                };
            }
        }

        public async Task<bool> UpdateFinPayee(FinPayee finpayee)
        {
            if (finpayee != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var roleplayerId = finpayee.RolePlayerId;
                    var entity = await _finPayeeRepository.FirstOrDefaultAsync(f => f.RolePlayerId == roleplayerId);

                    if (finpayee.IndustryId > 0)
                        entity.IndustryId = finpayee.IndustryId;

                    entity.DebtorStatus = finpayee.DebtorStatus;

                    _finPayeeRepository.Update(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                return await Task.FromResult(true);
            }
            return await Task.FromResult(false);
        }

        public async Task RolePlayerVopdSendRequest(Person rolePlayer)
        {
            Contract.Requires(rolePlayer != null);
            var vopdMessageStatus = new VopdRequestMessage()
            {
                RolePlayerId = rolePlayer.RolePlayerId,
                IdNumber = rolePlayer.IdNumber,
                IdReferenceNo = rolePlayer.IdNumber,
                MessageId = Guid.NewGuid().ToString(),
                VerificationType = VopdVerificationType.Status
            };

            var message = new client_VopdResponse()
            {
                RolePlayerId = rolePlayer.RolePlayerId,
                IdNumber = rolePlayer.IdNumber,
                VopdStatus = VopdStatusEnum.Processing,
                SubmittedDate = DateTimeHelper.SaNow
            };
            _vopdResponseRepository.Create(message);

            vopdMessageStatus.ImpersonateUser = SystemSettings.SystemUserAccount;
            if (await _configurationService.IsFeatureFlagSettingEnabled(IsVopdQuickTransactEnabled))
            {
                var vopdResponseMessage = await _quickTransactionVopdService.SubmitVOPDRequest(vopdMessageStatus);
                if (vopdResponseMessage.statusCode == "200")
                {
                    await RolePlayerVopdUpdate(vopdResponseMessage.VerificationResponse);
                }
            }
            else
            {
                var producer = new ServiceBusQueueProducer<VopdRequestMessage, VopdRequestMessageListener>(VopdRequestMessageListener.QueueName);
                await producer.PublishMessageAsync(vopdMessageStatus);
            }
        }

        public async Task<int> RolePlayerVopdUpdateRequest(VopdResponseMessage vopdMessage)
        {
            Contract.Requires(vopdMessage != null);
            var verificationDetail = vopdMessage.VerificationDetails.FirstOrDefault();
            var message = _vopdResponseRepository.OrderByDescending(x => x.VopdResponseId).FirstOrDefault(a => a.IdNumber == verificationDetail.IdNumber);
            if (message != null && message.Reason != vopdError)
            {
                var personDetails = await _personRepository.Where(c => c.RolePlayerId == message.RolePlayerId).FirstOrDefaultAsync();
                if (personDetails == null)
                {
                    return 0;
                }
                // await _vopdResponseRepository.LoadAsync(message, a => a.RolePlayer); this relationship does not exist in the DB removed by TT files
                message.Death = verificationDetail.DateOfDeath != null;
                message.DateOfDeath = verificationDetail.DateOfDeath ?? null;
                message.DeceasedStatus = verificationDetail.DeceasedStatus ?? null;

                if (verificationDetail.Surname != null && verificationDetail.Forename != null)
                {
                    message.Identity = string.Equals(personDetails.Surname, verificationDetail.Surname, StringComparison.OrdinalIgnoreCase)
                        && string.Equals(personDetails.FirstName, verificationDetail.Forename, StringComparison.OrdinalIgnoreCase);

                    message.Firstname = verificationDetail.Forename;
                    message.Surname = verificationDetail.Surname;
                }

                message.Reason = verificationDetail.ErrorMessage ?? null;
                message.VopdStatus = VopdStatusEnum.Processed;
                message.DateVerified = DateTime.Now;

                _vopdResponseRepository.Update(message);

                personDetails.IsAlive = true;

                if (message.Death == true)
                {
                    personDetails.DateOfDeath = Convert.ToDateTime(verificationDetail.DateOfDeath);
                    personDetails.IsAlive = false;
                }
                personDetails.DateVopdVerified = DateTime.Now;
                personDetails.IsVopdVerified = true;

                _personRepository.Update(personDetails);
                return message.RolePlayerId;
            }
            return 0;
        }

        public async Task<bool> DeleteRolePlayerRelation(RolePlayerRelation rolePlayerRelation)
        {
            if (rolePlayerRelation == null) return false;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingRelationship = await _rolePlayerRelationRepository
                    .FirstOrDefaultAsync(r => r.Id == rolePlayerRelation.Id);
                if (existingRelationship != null)
                {
                    var data = Mapper.Map<client_RolePlayerRelation>(existingRelationship);
                    _rolePlayerRelationRepository.Delete(data);

                }
                return await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
        }

        public async Task<bool> OverrideRolePlayerVopd(VopdUpdateResponseModel vopdUpdateResponse)
        {
            Contract.Requires(vopdUpdateResponse != null);
            if (RmaIdentity.UserId > 0) RmaIdentity.DemandPermission(Permissions.OverrideVopd);

            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {

                var vopdCreatedBy = string.IsNullOrEmpty(RmaIdentity.Username) ? vopdUpdateResponse.ModifiedBy : RmaIdentity.Username;
                var vopdResponse = await _vopdResponseRepository.Where(c => c.IdNumber == vopdUpdateResponse.IdNumber).OrderByDescending(x => x.VopdResponseId).FirstOrDefaultAsync();
                if (vopdResponse != null)
                {
                    vopdResponse.OverrideCount = vopdResponse.OverrideCount == null ? 0 : vopdResponse.OverrideCount;
                    if (vopdResponse.OverrideCount == 1)
                    {
                        return await Task.FromResult(false);
                    }
                    vopdResponse.OverrideCount += 1;
                    vopdResponse.Death = vopdUpdateResponse.DateOfDeath != null;
                    vopdResponse.DateOfDeath = vopdUpdateResponse.DateOfDeath.ToString() ?? null;
                    vopdResponse.DeceasedStatus = vopdUpdateResponse.DeceasedStatus ?? null;
                    vopdResponse.Identity = true;

                    vopdResponse.Reason = $"({vopdUpdateResponse.DeceasedStatus}) VOPD Manual Verification done by user: {vopdCreatedBy}";
                    vopdResponse.VopdStatus = VopdStatusEnum.ManualVerification;
                    vopdResponse.DateVerified = vopdUpdateResponse.VopdDatetime;

                    _vopdResponseRepository.Update(vopdResponse);
                }

                var userVopdResponse = _userVopdResponseRepository.OrderByDescending(x => x.UserVopdResponseId).FirstOrDefault(a => a.IdNumber == vopdUpdateResponse.IdNumber);
                if (userVopdResponse != null)
                {
                    userVopdResponse.Death = vopdUpdateResponse.DateOfDeath != null;
                    userVopdResponse.VopdStatus = VopdStatusEnum.ManualVerification;
                    userVopdResponse.Identity = true;
                    userVopdResponse.DateVerified = vopdUpdateResponse.VopdDatetime;
                    userVopdResponse.Reason = $"({vopdUpdateResponse.DeceasedStatus}) VOPD Manual Verification done by user: {vopdCreatedBy}";
                    _userVopdResponseRepository.Update(userVopdResponse);
                }

                var personDetails = await _personRepository.Where(c => c.IdNumber == vopdUpdateResponse.IdNumber).FirstOrDefaultAsync();
                if (personDetails != null)
                {
                    personDetails.IsAlive = vopdUpdateResponse.DateOfDeath == null;

                    if (vopdUpdateResponse.DateOfDeath == null)
                    {
                        personDetails.DateOfDeath = null;
                    }
                    else
                    {
                        personDetails.DateOfDeath = Convert.ToDateTime(vopdUpdateResponse.DateOfDeath);
                    }

                    personDetails.DateVopdVerified = vopdUpdateResponse.VopdDatetime;
                    personDetails.IsVopdVerified = true;

                    _personRepository.Update(personDetails);

                    await _rolePlayerNoteService.AddNote(new Common.Entities.Note()
                    {
                        ItemId = personDetails.RolePlayerId,
                        Text = $"({vopdUpdateResponse.DeceasedStatus}) {vopdUpdateResponse.FirstName}|{vopdUpdateResponse.Surname}|{vopdUpdateResponse.IdNumber}  VOPD Manual Verification done by user: {vopdCreatedBy} | DeceasedStatus:{vopdUpdateResponse.DeceasedStatus} | DateOfDeath: {vopdUpdateResponse.DateOfDeath}",
                        CreatedBy = vopdCreatedBy,
                        ModifiedBy = vopdCreatedBy
                    });
                }

                //Clear any VOPD erros for

                await ClearRolePlayerVOPDErros(vopdUpdateResponse);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return await Task.FromResult(true);
        }

        private async Task ClearRolePlayerVOPDErros(VopdUpdateResponseModel vopdUpdateResponse)
        {
            var deceasedStatusMessage = string.Empty;
            if (vopdUpdateResponse.DeceasedStatus != "ALIVE")
            {
                deceasedStatusMessage = $" {vopdUpdateResponse.FirstName}  with ID number {vopdUpdateResponse.IdNumber} is deceased, DateOfDeath: {vopdUpdateResponse.DateOfDeath?.ToString("yyyy-MM-dd")}";
            }

            using (_dbContextScopeFactory.Create())
            {
                var searchResults = await _rolePlayerRepository.SqlQueryAsync<int>(
                    DatabaseConstants.ClearConsolidatedFuneralImporVOPDErrorForMember,
                    new SqlParameter("MemberIdNumber", vopdUpdateResponse.IdNumber),
                    new SqlParameter("DeceasedStatusMessage", deceasedStatusMessage),
                    new SqlParameter("FileIdentifier", vopdUpdateResponse.FileIdentifier));

                await _rolePlayerRepository.SqlQueryAsync<int>(
                    DatabaseConstants.ClearMyValuePlusImporVOPDErrorForMember,
                    new SqlParameter("MemberIdNumber", vopdUpdateResponse.IdNumber),
                    new SqlParameter("DeceasedStatusMessage", deceasedStatusMessage),
                    new SqlParameter("FileIdentifier", vopdUpdateResponse.FileIdentifier));
            }
        }

        public async Task<RolePlayerModel> CreateDebtor(int rolePlayerId)
        {
            using (var _scope = _dbContextScopeFactory.Create())
            {
                var rolePlayer = await GetRolePlayer(rolePlayerId);
                if (rolePlayer.FinPayee != null)
                {
                    return Mapper.Map<RolePlayerModel>(rolePlayer);
                }

                var accountNumber = await GetAccountNumber(rolePlayer);

                var account = new client_FinPayee
                {
                    RolePlayerId = rolePlayerId,
                    FinPayeNumber = accountNumber,
                    IsAuthorised = true,
                    AuthroisedBy = RmaIdentity.Username,
                    AuthorisedDate = DateTimeHelper.SaNow,
                    IndustryId = rolePlayer.Company?.IndustryId
                };

                var entity = _finPayeeRepository.Create(account);
                await _scope.SaveChangesAsync().ConfigureAwait(false);

                rolePlayer.FinPayee = Mapper.Map<FinPayee>(entity);

                return rolePlayer;
            }
        }

        public async Task<PagedRequestResult<RolePlayerModel>> SearchDebtors(int industryClassId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var filter = !string.IsNullOrEmpty(pagedRequest.SearchCriteria) ? Convert.ToString(pagedRequest.SearchCriteria).ToUpper() : string.Empty;
                var industryClassFilters = industryClassId > 0 ? new List<IndustryClassEnum> { (IndustryClassEnum)industryClassId } : Enum.GetValues(typeof(IndustryClassEnum)).Cast<IndustryClassEnum>().ToList();


                var debtors = new PagedRequestResult<client_RolePlayer>();

                if (!string.IsNullOrEmpty(filter))
                {
                    debtors = await (from roleplayer in _rolePlayerRepository
                                     join finpayee in _finPayeeRepository
                                     on roleplayer.RolePlayerId equals finpayee.RolePlayerId
                                     join company in _companyRepository
                                     on roleplayer.RolePlayerId equals company.RolePlayerId
                                     where (roleplayer.DisplayName.Contains(filter) ||
                                     roleplayer.Company.IdNumber.Contains(filter) ||
                                     roleplayer.Company.CompensationFundReferenceNumber.Contains(filter) ||
                                     roleplayer.Company.ReferenceNumber.Contains(filter) ||
                                     roleplayer.Company.VatRegistrationNo.Contains(filter) ||
                                     finpayee.FinPayeNumber.Contains(filter)) &&
                                     (roleplayer.MemberStatus != MemberStatusEnum.New &&
                                     industryClassFilters.Contains(company.IndustryClass.Value))
                                     select roleplayer).ToPagedResult(pagedRequest);
                }
                else
                {
                    debtors = await (from roleplayer in _rolePlayerRepository
                                     join company in _companyRepository
                                     on roleplayer.RolePlayerId equals company.RolePlayerId
                                     join finpayee in _finPayeeRepository
                                     on roleplayer.RolePlayerId equals finpayee.RolePlayerId
                                     where roleplayer.MemberStatus != MemberStatusEnum.New &&
                                     industryClassFilters.Contains(company.IndustryClass.Value)
                                     select roleplayer).ToPagedResult(pagedRequest);
                }

                await _rolePlayerRepository.LoadAsync(debtors.Data, t => t.Company);
                await _rolePlayerRepository.LoadAsync(debtors.Data, t => t.FinPayee);
                var data = Mapper.Map<List<RolePlayerModel>>(debtors.Data);

                return new PagedRequestResult<RolePlayerModel>
                {
                    Data = data,
                    RowCount = debtors.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(debtors.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<RolePlayerModel> GetRolePlayerPersonByIdOrPassport(string idPassportNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayer = await _rolePlayerRepository.FirstOrDefaultAsync(c => c.Person.IdNumber.Equals(idPassportNumber, StringComparison.InvariantCultureIgnoreCase));
                if (rolePlayer != null)
                {
                    await _rolePlayerRepository.LoadAsync(rolePlayer, d => d.Person);
                    await _personRepository.LoadAsync(rolePlayer.Person, p => p.PersonEmployments);

                    await _rolePlayerRepository.LoadAsync(rolePlayer, d => d.RolePlayerContacts);
                    await _rolePlayerContactRepository.LoadAsync(rolePlayer.RolePlayerContacts, c => c.RolePlayerContactInformations);

                    await _rolePlayerRepository.LoadAsync(rolePlayer, d => d.RolePlayerAddresses);
                    await _rolePlayerRepository.LoadAsync(rolePlayer, d => d.RolePlayerBankingDetails);
                }

                return Mapper.Map<RolePlayerModel>(rolePlayer);
            }
        }

        public async Task<PagedRequestResult<PersonEmployment>> GetPagedPersonEmployment(int employerRolePlayerId, int employeeRolePlayerId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var employments = new PagedRequestResult<client_PersonEmployment>();

                if (employerRolePlayerId <= 0 && employeeRolePlayerId > 0)
                {
                    employments = await (from employment in _personEmployment
                                         where employment.EmployeeRolePlayerId == employeeRolePlayerId
                                         select employment).ToPagedResult(pagedRequest);
                }
                else
                {
                    employments = await (from employment in _personEmployment
                                         where employment.EmployeeRolePlayerId == employeeRolePlayerId &&
                                         employment.EmployerRolePlayerId == employerRolePlayerId
                                         select employment).ToPagedResult(pagedRequest);
                }


                var data = Mapper.Map<List<PersonEmployment>>(employments.Data);

                return new PagedRequestResult<PersonEmployment>
                {
                    Data = data,
                    RowCount = employments.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(employments.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<PagedRequestResult<RolePlayerModel>> GetPagedRolePlayers(int rolePlayerIdentificationTypeId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var filter = !string.IsNullOrEmpty(pagedRequest.SearchCriteria) ? Convert.ToString(pagedRequest.SearchCriteria).ToUpper() : string.Empty;

                var rolePlayerIdentificationTypeFilters = rolePlayerIdentificationTypeId > 0 ? new List<RolePlayerIdentificationTypeEnum> { (RolePlayerIdentificationTypeEnum)rolePlayerIdentificationTypeId } : Enum.GetValues(typeof(RolePlayerIdentificationTypeEnum)).Cast<RolePlayerIdentificationTypeEnum>().ToList();

                var rolePlayers = new PagedRequestResult<client_RolePlayer>();

                if (!string.IsNullOrEmpty(filter))
                {
                    rolePlayers = await (from roleplayer in _rolePlayerRepository
                                         where (
                                            (
                                                 roleplayer.DisplayName.ToUpper().Contains(filter) ||
                                                 roleplayer.Company.IdNumber.ToUpper().Contains(filter) ||
                                                 roleplayer.Company.CompensationFundReferenceNumber.ToUpper().Contains(filter) ||
                                                 roleplayer.Company.ReferenceNumber.ToUpper().Contains(filter) ||
                                                 roleplayer.Company.VatRegistrationNo.ToUpper().Contains(filter) ||
                                                 roleplayer.Person.IdNumber.ToUpper().Contains(filter) ||
                                                 roleplayer.Person.DeathCertificateNumber.ToUpper().Contains(filter) ||
                                                 roleplayer.FinPayee.FinPayeNumber.ToUpper().Contains(filter)
                                             )
                                             && rolePlayerIdentificationTypeFilters.Contains(roleplayer.RolePlayerIdentificationType))
                                             && roleplayer.MemberStatus != MemberStatusEnum.New
                                         select roleplayer).ToPagedResult(pagedRequest);
                }
                else
                {
                    rolePlayers = await (from roleplayer in _rolePlayerRepository
                                         where (
                                            rolePlayerIdentificationTypeFilters.Contains(roleplayer.RolePlayerIdentificationType))
                                            && roleplayer.MemberStatus != MemberStatusEnum.New
                                         select roleplayer).ToPagedResult(pagedRequest);
                }

                await _rolePlayerRepository.LoadAsync(rolePlayers.Data, t => t.Person);
                await _rolePlayerRepository.LoadAsync(rolePlayers.Data, t => t.Company);
                await _rolePlayerRepository.LoadAsync(rolePlayers.Data, t => t.FinPayee);

                var data = Mapper.Map<List<RolePlayerModel>>(rolePlayers.Data);

                return new PagedRequestResult<RolePlayerModel>
                {
                    Data = data,
                    RowCount = rolePlayers.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(rolePlayers.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<PagedRequestResult<RolePlayerModel>> GetPagedRolePlayerRelations(int fromRolePlayerId, int rolePlayerTypeId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var rolePlayerTypeFilters = rolePlayerTypeId > 0 ? new List<RolePlayerTypeEnum> { (RolePlayerTypeEnum)rolePlayerTypeId } : Enum.GetValues(typeof(RolePlayerTypeEnum)).Cast<RolePlayerTypeEnum>().ToList();

                var rolePlayers = new PagedRequestResult<client_RolePlayer>();

                rolePlayers = await (from roleplayer in _rolePlayerRepository
                                     join relation in _rolePlayerRelationRepository
                                     on roleplayer.RolePlayerId equals relation.ToRolePlayerId
                                     where relation.FromRolePlayerId == fromRolePlayerId
                                     && rolePlayerTypeFilters.Contains((RolePlayerTypeEnum)relation.RolePlayerType.RolePlayerTypeId)
                                     select roleplayer).ToPagedResult(pagedRequest);


                await _rolePlayerRepository.LoadAsync(rolePlayers.Data, t => t.Person);
                await _rolePlayerRepository.LoadAsync(rolePlayers.Data, t => t.Company);
                await _rolePlayerRepository.LoadAsync(rolePlayers.Data, t => t.RolePlayerBankingDetails);

                var data = Mapper.Map<List<RolePlayerModel>>(rolePlayers.Data);

                return new PagedRequestResult<RolePlayerModel>
                {
                    Data = data,
                    RowCount = rolePlayers.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(rolePlayers.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<List<RolePlayerRelation>> GetAllRolePlayerRelations(int fromRolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var relations = await _rolePlayerRelationRepository.Where(s => s.FromRolePlayerId == fromRolePlayerId).ToListAsync();
                return Mapper.Map<List<RolePlayerRelation>>(relations);
            }
        }

        public async Task<PagedRequestResult<RolePlayerModel>> GetPagedRolePlayerPolicyRelations(int rolePlayerId, int policyId, int rolePlayerTypeId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var rolePlayers = new PagedRequestResult<client_RolePlayer>();
                var rolePlayerIds = _rolePlayerRelationRepository.Where(s => s.ToRolePlayerId == rolePlayerId && s.PolicyId == policyId && s.RolePlayerTypeId == rolePlayerTypeId).Select(t => t.FromRolePlayerId).ToList();
                rolePlayers = await (from roleplayer in _rolePlayerRepository
                                     where rolePlayerIds.Contains(roleplayer.RolePlayerId)
                                     select roleplayer).ToPagedResult(pagedRequest);
                await _rolePlayerRepository.LoadAsync(rolePlayers.Data, t => t.Person);
                foreach (var rolePlayer in rolePlayers.Data)
                {
                    var relation = await _rolePlayerRelationRepository.FirstOrDefaultAsync(s => s.ToRolePlayerId == rolePlayerId && s.FromRolePlayerId == rolePlayer.RolePlayerId && s.PolicyId == policyId && s.RolePlayerTypeId == rolePlayerTypeId);
                    if (relation != null)
                    {
                        await _rolePlayerRelationRepository.LoadAsync(relation, s => s.RolePlayerRelationLife);
                        if (rolePlayer.RolePlayerRelations_ToRolePlayerId == null) { rolePlayer.RolePlayerRelations_ToRolePlayerId = new List<client_RolePlayerRelation>(); }
                        rolePlayer.RolePlayerRelations_ToRolePlayerId.Add(relation);
                    }
                }
                var data = Mapper.Map<List<RolePlayerModel>>(rolePlayers.Data);
                return new PagedRequestResult<RolePlayerModel>
                {
                    Data = data,
                    RowCount = rolePlayers.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(rolePlayers.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<List<string>> GetDebtorBankAccountNumbers(string finPayeeNumber)
        {
            var linkedBankAccounts = new List<string>();
            string allowedbankaccount = string.Empty;

            var debtor = await GetFinPayeeByFinpayeNumber(finPayeeNumber);

            var fromDebtorIndustry = await _industryService.GetIndustry(debtor.IndustryId);

            var debtorPolicies = await
                _rolePlayerPolicyService.GetPoliciesByPolicyOwnerIdNoRefData(debtor.RolePlayerId);

            if (debtorPolicies.Count == 0)
            {
                return linkedBankAccounts;
            }

            List<ProductBankAccount> productBankAccounts = new List<ProductBankAccount>();

            foreach (var policy in debtorPolicies)
            {
                var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                productBankAccounts.AddRange(product.ProductBankAccounts.Where(p =>
                    p.IndustryClass == fromDebtorIndustry.IndustryClass).ToList());
            }

            if (productBankAccounts.Count == 0)
            {
                return linkedBankAccounts;
            }

            foreach (var productBankAccount in productBankAccounts)
            {
                var accountNumber = await _bankAccountService.GetBankAccountByAccountNumber(productBankAccount.BankAccountId);
                linkedBankAccounts.Add(accountNumber.AccountNumber);
            }

            return linkedBankAccounts;
        }

        public async Task<List<RolePlayerModel>> GetBeneficiaries(List<int> roleplayerIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayers = await _rolePlayerRepository.Where(a => roleplayerIds.Contains(a.RolePlayerId)).ToListAsync();
                await _rolePlayerRepository.LoadAsync(rolePlayers, rp => rp.Person);
                await _rolePlayerRepository.LoadAsync(rolePlayers, rp => rp.RolePlayerAddresses);
                await _rolePlayerRepository.LoadAsync(rolePlayers, rp => rp.RolePlayerRelations_ToRolePlayerId);
                await _rolePlayerRepository.LoadAsync(rolePlayers, rp => rp.RolePlayerRelations_FromRolePlayerId);

                var result = Mapper.Map<List<RolePlayerModel>>(rolePlayers);
                return result;
            }
        }

        public async Task<int> BulkDebtorHandover(List<FinPayee> finpayees)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var debtors = new List<client_FinPayee>();

                foreach (var finpayee in finpayees)
                {
                    var debtor = _finPayeeRepository.FirstOrDefault(s => s.FinPayeNumber.ToLower() == finpayee.FinPayeNumber.ToLower().Trim());
                    if (debtor != null)
                    {
                        debtor.DebtorStatus = finpayee.DebtorStatus;
                        debtors.Add(debtor);
                    }
                }

                if (debtors.Count > 0)
                {
                    _finPayeeRepository.Update(debtors);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }

                return debtors.Count;
            }
        }
    }
}

