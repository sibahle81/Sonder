using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Broker
{
    public class RepresentativeFacade : RemotingStatelessService, IRepresentativeService
    {
        private readonly IRepository<broker_Representative> _representativeRepository;
        private readonly IRepository<broker_BrokerageRepresentative> _brokerageRepresentativeRepository;
        private readonly IRepository<broker_BrokerageContact> _brokerageContact;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IAuditWriter _auditWriter;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<broker_Brokerage> _brokerageRepository;
        private readonly IRepository<broker_RepresentativeFscaLicenseCategory> _representativeFscaLicenseCategoryRepository;
        private readonly IRepository<broker_FscaLicenseCategory> _brokerFscaLicenseCategoryRepository;
        private readonly IRepository<product_Product> _productRepository;
        private readonly IRepository<policy_PolicyBroker> _policyBrokerRepository;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<broker_BrokerageFscaLicenseCategory> _brokerageFscaLicenseCategoryRepository;
        private readonly IRepository<broker_BrokerPartnership> _brokerPartnershipRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IUserService _userService;

        public RepresentativeFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<broker_Representative> representatives,
            IRepository<broker_BrokerageContact> brokerageContact,
            IRepository<broker_BrokerageRepresentative> brokerageRepresentativeRepository,
            IRepository<broker_Brokerage> brokerageRepository,
            IAuditWriter clientAuditWriter,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<broker_RepresentativeFscaLicenseCategory> representativeFscaLicenseCategoryRepository,
            IRepository<broker_FscaLicenseCategory> brokerFscaLicenseCategoryRepository,
            IRepository<product_Product> productRepository,
            IRepository<policy_PolicyBroker> policyBrokerRepository,
            IRepository<policy_Policy> policyRepository,
            IRepository<broker_BrokerageFscaLicenseCategory> brokerageFscaLicenseCategoryRepository,
            IRepository<broker_BrokerPartnership> brokerPartnershipRepository,
            IConfigurationService configurationService,
            IUserService userService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _representativeRepository = representatives;
            _brokerageContact = brokerageContact;
            _brokerageRepresentativeRepository = brokerageRepresentativeRepository;
            _auditWriter = clientAuditWriter;
            _documentGeneratorService = documentGeneratorService;
            _brokerageRepository = brokerageRepository;
            _representativeFscaLicenseCategoryRepository = representativeFscaLicenseCategoryRepository;
            _brokerFscaLicenseCategoryRepository = brokerFscaLicenseCategoryRepository;
            _productRepository = productRepository;
            _policyRepository = policyRepository;
            _policyBrokerRepository = policyBrokerRepository;
            _brokerageFscaLicenseCategoryRepository = brokerageFscaLicenseCategoryRepository;
            _brokerPartnershipRepository = brokerPartnershipRepository;
            _configurationService = configurationService;
            _userService = userService;
        }

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";

        public async Task<Representative> GetRepresentative(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var representative = await _representativeRepository
                    .SingleAsync(s => s.Id == id, $"Could not find a representative with the id {id}");
                await _representativeRepository.LoadAsync(representative, r => r.BrokerageRepresentatives);
                await _representativeRepository.LoadAsync(representative, r => r.RepresentativeChecks);
                await _representativeRepository.LoadAsync(representative, r => r.RepresentativeNotes);
                await _representativeRepository.LoadAsync(representative, r => r.RepresentativeBankAccounts);
                await _auditWriter.AddLastViewed<broker_Representative>(id);
                return Mapper.Map<Representative>(representative);
            }
        }

        public async Task<Representative> GetRepresentativeReferenceData(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var representative = await _representativeRepository.Where(s => s.Id == id).SingleOrDefaultAsync();

                return Mapper.Map<Representative>(representative);
            }
        }

        public async Task<List<Brokerage>> GetBrokeragesForRepresentative(int representativeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerageRepresentatives = await _brokerageRepresentativeRepository
                    .Where(s => s.RepresentativeId == representativeId).ToListAsync();
                var brokerageIds = brokerageRepresentatives.Select(s => s.BrokerageId);
                var brokerages = await _brokerageRepository.Where(t => brokerageIds.Contains(t.Id)).ToListAsync();
                await _brokerageRepository.LoadAsync(brokerages, r => r.BrokerageContacts);
                await _brokerageRepository.LoadAsync(brokerages, r => r.BrokerageBrokerConsultants);
                return Mapper.Map<List<Brokerage>>(brokerages);
            }
        }

        public async Task<List<Representative>> GetRepresentatives()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _representativeRepository.ToListAsync();
                await _representativeRepository.LoadAsync(results, r => r.BrokerageRepresentatives);
                await _representativeRepository.LoadAsync(results, r => r.RepresentativeChecks);

                return Mapper.Map<List<Representative>>(results);
            }
        }

        public async Task<int> AddRepresentative(Representative representative)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddRepresentative);
            if (representative != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    if (string.IsNullOrEmpty(representative.Code))
                    {
                        if (representative.RepType.HasValue)
                        {
                            representative.Code = await GenerateRepCodeAsync(representative.RepType.Value);
                        }
                    }

                    var entity = Mapper.Map<broker_Representative>(representative);
                    //missing fields on front end....
                    entity.IdType = IdTypeEnum.SAIDDocument;
                    var brokerResult = _representativeRepository.Create(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    return brokerResult.Id;
                }
            }
            return 0;
        }

        public async Task EditRepresentative(Representative representative)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRepresentativeWizard);
            if (representative != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    broker_Representative entity = null;
                    if (representative != null)
                    {
                        entity = Mapper.Map<broker_Representative>(representative);
                    }

                    await _representativeRepository.LoadAsync(entity, r => r.RepresentativeChecks);
                    // add new representative checks
                    var checksToAdd = representative.RepresentativeChecks.Where(r =>
                        entity.RepresentativeChecks.SingleOrDefault(a => a.ValidityChecksetId == r.ValidityChecksetId
                                                                         && a.RepresentativeId == r.ItemId) == null);
                    foreach (var checkItem in checksToAdd)
                    {
                        entity.RepresentativeChecks.Add(new broker_RepresentativeCheck()
                        {
                            ValidityChecksetId = checkItem.ValidityChecksetId,
                            RepresentativeId = checkItem.ItemId
                        });
                    }

                    // add new bank accounts 
                    var bankAccounts = new List<broker_RepresentativeBankAccount>();
                    bankAccounts = entity.RepresentativeBankAccounts.Where(r => r.Id == 0).ToList();
                    foreach (var bankAccItem in bankAccounts)
                    {
                        entity.RepresentativeBankAccounts.Add(new broker_RepresentativeBankAccount()
                        {
                            RepresentativeId = entity.Id,
                            EffectiveDate = bankAccItem.EffectiveDate,
                            AccountNumber = bankAccItem.AccountNumber,
                            BankBranchId = bankAccItem.BankBranchId,
                            BankAccountType = bankAccItem.BankAccountType,
                            AccountHolderName = bankAccItem.AccountHolderName,
                            BranchCode = bankAccItem.BranchCode,
                            ApprovalRequestedFor = bankAccItem.ApprovalRequestedFor,
                            ApprovalRequestId = bankAccItem.ApprovalRequestId,
                            IsApproved = bankAccItem.IsApproved,
                            Reason = bankAccItem.Reason
                        });
                    }

                    // update representative checks
                    var checksToUpdate = representative.RepresentativeChecks
                        .Where(r => entity.RepresentativeChecks
                                        .SingleOrDefault(a => a.ValidityChecksetId == r.ValidityChecksetId
                                                              && a.RepresentativeId == r.ItemId) != null);

                    foreach (var entry in checksToUpdate)
                    {
                        var existingCheck = entity.RepresentativeChecks.Single(i =>
                            i.ValidityChecksetId == entry.ValidityChecksetId && i.RepresentativeId == entry.ItemId);
                        if (entry.IsChecked != existingCheck.IsChecked)
                        {
                            entity.RepresentativeChecks.Single(i =>
                                        i.ValidityChecksetId == entry.ValidityChecksetId &&
                                        i.RepresentativeId == entry.ItemId)
                                    .IsChecked =
                                entry.IsChecked;
                        }
                    }

                    _representativeRepository.Update(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        public async Task LinkRepresentative(LinkAgent representative)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditRepresentativeWizard);
            if (representative != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entity = await _representativeRepository
                        .SingleAsync(r => r.Id == representative.Id,
                            $"Could not find representative with id {representative.Id}.");

                    await _representativeRepository.LoadAsync(entity, r => r.RepresentativeChecks);

                    // add new representative checks
                    var checksToAdd = representative.RepresentativeChecks
                        .Where(r => entity.RepresentativeChecks
                                        .SingleOrDefault(a => a.ValidityChecksetId == r.ValidityChecksetId
                                                              && a.RepresentativeId == r.ItemId
                                        ) == null
                        );
                    foreach (var checkItem in checksToAdd)
                    {
                        entity.RepresentativeChecks.Add(new broker_RepresentativeCheck()
                        {
                            ValidityChecksetId = checkItem.ValidityChecksetId,
                            RepresentativeId = checkItem.ItemId
                        });
                    }

                    // update representative checks
                    var checksToUpdate = representative.RepresentativeChecks
                        .Where(r => entity.RepresentativeChecks
                                        .SingleOrDefault(a => a.ValidityChecksetId == r.ValidityChecksetId
                                                              && a.RepresentativeId == r.ItemId
                                        ) != null
                        );
                    foreach (var entry in checksToUpdate)
                    {
                        var existingCheck = entity.RepresentativeChecks
                            .Single(i => i.ValidityChecksetId == entry.ValidityChecksetId
                                         && i.RepresentativeId == entry.ItemId);
                        if (entry.IsChecked != existingCheck.IsChecked)
                        {
                            entity.RepresentativeChecks
                                .Single(i => i.ValidityChecksetId == entry.ValidityChecksetId
                                             && i.RepresentativeId == entry.ItemId
                                ).IsChecked = entry.IsChecked;
                        }
                    }

                    // add notes
                    var mappedNotes = Mapper.Map<List<broker_RepresentativeNote>>(representative.RepresentativeNotes);
                    mappedNotes.ForEach(c => entity.RepresentativeNotes.Add(c));

                    // update brokerage links
                    entity.ContactNumber = representative.ContactNumber;
                    entity.Email = representative.Email;
                    entity.PaymentFrequency = representative.PaymentFrequency;
                    entity.PaymentMethod = representative.PaymentMethod;
                    entity.RepresentativeFscaLicenseCategories.Clear();
                    entity.BrokerageRepresentatives.Clear();
                    entity.BrokerageRepresentatives =
                        Mapper.Map<List<broker_BrokerageRepresentative>>(representative.BrokerageRepresentatives);

                    foreach (var br in entity.BrokerageRepresentatives)
                    {
                        var brokerCategories = await _brokerageFscaLicenseCategoryRepository
                        .Where(c => c.BrokerageId == br.BrokerageId)
                        .GroupBy(r => new
                        {
                            brokerageId = r.BrokerageId,
                            fscaLicenseCategoryId = r.FscaLicenseCategoryId
                        })
                        .Select(b => new
                        {
                            BrokerageId = b.Key.brokerageId,
                            FscaLicenseCategoryId = b.Key.fscaLicenseCategoryId,
                            AdviceDateActive = b.Max(a => a.AdviceDateActive),
                            IntermediaryDateActive = b.Max(i => i.IntermediaryDateActive)
                        })
                        .ToListAsync();


                        foreach (var cat in brokerCategories)
                        {
                            var representativeBrokerageCategoryLink = await _representativeFscaLicenseCategoryRepository
                                .Where(r => r.RepresentativeId == representative.Id
                                && r.BrokerageId == cat.BrokerageId
                                && r.FscaLicenseCategoryId == cat.FscaLicenseCategoryId)
                                .FirstOrDefaultAsync();

                            if (representativeBrokerageCategoryLink == null)
                            {
                                entity.RepresentativeFscaLicenseCategories.Add(new broker_RepresentativeFscaLicenseCategory()
                                {
                                    BrokerageId = cat.BrokerageId,
                                    FscaLicenseCategoryId = cat.FscaLicenseCategoryId,
                                    AdviceDateActive = cat.AdviceDateActive,
                                    IntermediaryDateActive = cat.IntermediaryDateActive,
                                    SusDateActive = null,
                                });
                            }
                        }

                        if (br.StartDate.HasValue)
                        {
                            br.StartDate = br.StartDate.Value.ToSaDateTime();
                        }

                        if (br.EndDate.HasValue)
                        {
                            br.EndDate = br.EndDate.Value.ToSaDateTime();
                        }
                    }
                    _representativeRepository.Update(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }

        private async Task UpdateRepChecks(Representative representative)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _representativeRepository
                    .SingleAsync(r => r.Id == representative.Id,
                        $"Could not find a representative with id {representative.Id}.");

                await _representativeRepository.LoadAsync(entity, r => r.RepresentativeChecks);

                // add new representative checks
                var checksToAdd = representative.RepresentativeChecks.Where(r =>
                    entity.RepresentativeChecks.SingleOrDefault(a => a.ValidityChecksetId == r.ValidityChecksetId
                                                                     && a.RepresentativeId == r.ItemId) == null);
                foreach (var checkItem in checksToAdd)
                {
                    entity.RepresentativeChecks.Add(new broker_RepresentativeCheck()
                    {
                        ValidityChecksetId = checkItem.ValidityChecksetId,
                        RepresentativeId = checkItem.ItemId
                    });
                }

                // update representative checks
                var checksToUpdate = representative.RepresentativeChecks.Where(r =>
                    entity.RepresentativeChecks.SingleOrDefault(a => a.ValidityChecksetId == r.ValidityChecksetId
                                                                     && a.RepresentativeId == r.ItemId) != null);
                foreach (var entry in checksToUpdate)
                {
                    var existingCheck = entity.RepresentativeChecks.Single(i =>
                        i.ValidityChecksetId == entry.ValidityChecksetId && i.RepresentativeId == entry.ItemId);
                    if (entry.IsChecked != existingCheck.IsChecked)
                    {
                        entity.RepresentativeChecks.Single(i =>
                                    i.ValidityChecksetId == entry.ValidityChecksetId &&
                                    i.RepresentativeId == entry.ItemId)
                                .IsChecked =
                            entry.IsChecked;
                    }
                }

                _representativeRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<Representative>> SearchRepresentative(string query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                // && ($"{broker.FirstName} {broker.SurnameOrCompanyName}".Contains(query)
                var results = await _representativeRepository
                    .Where(broker => !broker.IsDeleted
                                     && (broker.FirstName.Contains(query)
                                         || broker.SurnameOrCompanyName.Contains(query)
                                         || broker.Code.Contains(query)
                                         || broker.IdNumber.Contains(query)))
                    .ToListAsync();

                await _representativeRepository.LoadAsync(results, r => r.BrokerageRepresentatives);
                await _representativeRepository.LoadAsync(results, r => r.RepresentativeChecks);
                await _representativeRepository.LoadAsync(results, r => r.RepresentativeNotes);

                return Mapper.Map<List<Representative>>(results);
            }
        }

        public async Task<List<Representative>> SearchNaturalRepresentatives(string query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _representativeRepository
                    .Where(rep => !rep.IsDeleted
                                  && rep.RepType == RepTypeEnum.Natural
                                  && (rep.FirstName.Contains(query)
                                      || rep.SurnameOrCompanyName.Contains(query)
                                      || rep.Code.Contains(query)
                                      || rep.IdNumber.Contains(query)))
                    .ToListAsync();
                await _representativeRepository.LoadAsync(results, r => r.BrokerageRepresentatives);
                var representatives = Mapper.Map<List<Representative>>(results);
                return representatives.Where(r => r.ActiveBrokerage != null).ToList();
            }
        }

        public async Task<PagedRequestResult<Representative>> SearchRepresentatives(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var representatives = await _representativeRepository
                    .Where(r => string.IsNullOrEmpty(request.SearchCriteria) ||
                                (r.FirstName.Contains(request.SearchCriteria)
                                 || r.SurnameOrCompanyName.Contains(request.SearchCriteria)
                                 || r.Code.Contains(request.SearchCriteria)
                                 || r.IdNumber.Contains(request.SearchCriteria)))
                    .ToPagedResult<broker_Representative, Representative>(request);
                return representatives;
            }
        }

        public async Task<List<Representative>> GetRepresentativeByBrokerageId(int brokerageId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var today = DateTimeHelper.SaNow.Date;
                var results = await _representativeRepository
                    .Where(r => r.BrokerageRepresentatives.Any(
                        br => br.BrokerageId == brokerageId
                              && br.StartDate <= today
                              && (br.EndDate.HasValue ? br.EndDate : today) >= today
                    ))
                    .ToListAsync();

                await _representativeRepository.LoadAsync(results, r => r.BrokerageRepresentatives);
                return Mapper.Map<List<Representative>>(results);
            }
        }

        public async Task<List<Representative>> GetRepresentativesByJuristicRepId(int representativeId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _representativeRepository
                    .Where(r => r.BrokerageRepresentatives.Any(br => br.JuristicRepId == representativeId))
                    .ToListAsync();
                await _representativeRepository.LoadAsync(entities, r => r.BrokerageRepresentatives);
                return Mapper.Map<List<Representative>>(entities);
            }
        }

        public async Task<List<Representative>> GetJuristicRepresentatives(List<int> brokerageIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _representativeRepository
                    .Where(r => r.RepType == RepTypeEnum.Juristic
                                && r.BrokerageRepresentatives.Any(
                                    br => brokerageIds.Contains(br.BrokerageId)
                                          && br.StartDate.HasValue
                                )
                    )
                    .ToListAsync();
                await _representativeRepository.LoadAsync(entities, r => r.BrokerageRepresentatives);
                return Mapper.Map<List<Representative>>(entities);
            }
        }

        public async Task<List<RepEntity>> GetRepresentativeByBrokerageIdForRepEnity(int brokerageId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _representativeRepository
                    .Where(r => r.BrokerageRepresentatives.Any(
                        br => br.BrokerageId == brokerageId))
                    .ToListAsync();
                await _representativeRepository.LoadAsync(results, r => r.BrokerageRepresentatives);
                return Mapper.Map<List<RepEntity>>(results);
            }
        }

        private async Task<string> GenerateRepCodeAsync(RepTypeEnum rep)
        {
            if (rep == RepTypeEnum.Natural)
            {
                return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.NaturalRep, "");
            }

            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.JuristicRep, "");

        }

        public async Task<List<Contracts.Entities.Product.Product>> GetProductsRepCanSell(int representativeId,
            int brokerageId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var licenceCategoryIds = _representativeFscaLicenseCategoryRepository
                    .Where(c => c.BrokerageId == brokerageId && c.RepresentativeId == representativeId)
                    .Select(c => c.FscaLicenseCategoryId).ToList();
                var productClasses = _brokerFscaLicenseCategoryRepository.Where(c => licenceCategoryIds.Contains(c.Id))
                    .Select(c => c.ProductClass).ToList();

                var products = await _productRepository
                    .Where(c => !c.IsDeleted && productClasses.Contains(c.ProductClass)).ToListAsync();
                var mapped = Mapper.Map<List<Contracts.Entities.Product.Product>>(products);
                return mapped;
            }
        }

        public async Task<List<Brokerage>> GetBrokeragesEligibleToReceiveRepresentativePolicies(int representativeId,
            List<int> productIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var allowedBrokerages = new List<Brokerage>();

                var entities = await _brokerageRepository.ToListAsync();
                var brokerages = Mapper.Map<List<Brokerage>>(entities);

                foreach (var brokerage in brokerages)
                {
                    var licenceCategoryIds =
                        _brokerageFscaLicenseCategoryRepository.Where(c => c.BrokerageId == brokerage.Id)
                            .Select(c => c.FscaLicenseCategoryId).ToList();
                    var productClasses = _brokerFscaLicenseCategoryRepository
                        .Where(c => licenceCategoryIds.Contains(c.Id)).Select(c => c.ProductClass).ToList();

                    var products = await _productRepository
                        .Where(c => !c.IsDeleted && productClasses.Contains(c.ProductClass)).ToListAsync();
                    if (!productIds.Except(products.Select(p => p.Id)).Any() || !productIds.Any())
                    {
                        allowedBrokerages.Add(brokerage);
                    }
                }

                return allowedBrokerages;
            }
        }

        public async Task<bool> IsRepAllowedToSellProducts(int representativeId, List<int> productIds)
        {
            var representative = await GetRepresentative(representativeId);
            var productsRepCanSell = await GetProductsRepCanSell(representative.Id, representative.ActiveBrokerage.BrokerageId);
            return !productIds.Except(productsRepCanSell.Select(p => p.Id)).Any();
        }

        public async Task<List<Representative>> GetJuristicRepresentativesByIds(List<int> representativeIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _representativeRepository
                    .Where(c => representativeIds.Contains(c.Id)).ToListAsync();
                return Mapper.Map<List<Representative>>(entities);
            }
        }

        public async Task<Representative> GetRepresentativeWithNoRefData(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var broker = await _representativeRepository.FirstOrDefaultAsync(s => s.Id == id);

                return Mapper.Map<Representative>(broker);
            }
        }

        public async Task<List<ContactPerson>> GetInternalAndExternalContactsByRepId(int repId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var contactList = new List<ContactPerson>();
                var broker = (await GetBrokeragesForRepresentative(repId)).OrderByDescending(a => a.StartDate).FirstOrDefault();
                var contact = await _brokerageContact.Where(r => r.BrokerageId == broker.Id && r.ContactType == ContactTypeEnum.BrokerContact).FirstOrDefaultAsync();

                if (broker != null)
                {
                    var brokerDisplayTitle = broker.Code + " - " + broker.TradeName + " (FSP No:" + broker.FspNumber + ")";
                    if (contact != null)
                    {
                        contactList.Add(new ContactPerson()
                        {
                            Name = contact.FirstName + " " + contact.LastName,
                            Surname = "(Broker Contact)",
                            ContactNumber = contact.MobileNumber,
                            Email = contact.Email,
                            Title = brokerDisplayTitle
                        });
                    }
                    //                    var user = await _userService.GetUserById(broker.BrokerageBrokerConsultantIds[0]);

                    contactList.Add(new ContactPerson()
                    {
                        Name = broker.BrokerageBrokerConsultants[0].DisplayName,
                        Surname = "(Broker Representative)",
                        ContactNumber = broker.BrokerageBrokerConsultants[0].TelNo,
                        Email = broker.BrokerageBrokerConsultants[0].Email,
                        Title = brokerDisplayTitle
                    });
                }

                return contactList;
            }
        }

        public async Task<List<Representative>> GetJuristicRepresentativesActivePolicies()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _policyRepository
                    .Where(c => c.JuristicRepresentative != null)
                    .Select(c => new Representative { Id = c.JuristicRepresentative.Id, SurnameOrCompanyName = c.JuristicRepresentative.SurnameOrCompanyName })
                    .Distinct()
                    .ToListAsync();
                return results;
            }
        }
        public async Task<BrokerPartnership> GetBrokerPartnership(int brokerageId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerPartnership = await _brokerPartnershipRepository.FirstOrDefaultAsync(b => b.BrokerageId == brokerageId);
                return Mapper.Map<BrokerPartnership>(brokerPartnership);
            }
        }

        public async Task<BrokerPartnership> GetBrokerPartnershipByPolicyId(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerPartnership = await _brokerPartnershipRepository.FirstOrDefaultAsync(b => b.Brokerage.Policies.Any(p => p.PolicyId == policyId));
                return Mapper.Map<BrokerPartnership>(brokerPartnership);
            }
        }

        public async Task<List<BrokerPartnership>> GetBrokerPartnerships(List<int> brokerageIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerPartnerships = await _brokerPartnershipRepository.Where(b => brokerageIds.Contains(b.BrokerageId)).ToListAsync();
                return Mapper.Map<List<BrokerPartnership>>(brokerPartnerships);
            }
        }
    }
}




