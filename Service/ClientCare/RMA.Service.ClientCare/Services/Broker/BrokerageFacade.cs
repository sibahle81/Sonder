using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Client;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.Integrations.Contracts.Entities.Fspe;
using RMA.Service.Integrations.Contracts.Interfaces.Fspe;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Broker
{
    public class BrokerageFacade : RemotingStatelessService, IBrokerageService
    {
        private readonly IRepository<broker_Brokerage> _brokerageRepository;
        private readonly IRepository<broker_BrokerageFscaLicenseCategory> _brokerLicenseCategoryRepo;
        private readonly IRepository<broker_Representative> _representativeRepository;

        private readonly IRepository<broker_BrokerageRepresentative> _brokerageRepresentativeRepository;
        private readonly IRepository<broker_BrokerageProductOption> _brokerageProductOptionRepository;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IRepository<client_OrganisationOptionItemValue> _organisationOptionItemValueRepository;

        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IAuditWriter _auditWriter;
        private readonly IFspeService _fspeService;
        private readonly IUserService _userService;
        private readonly ISendEmailService _sendEmailService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly IRepository<broker_BrokerageImportRequest> _brokerBrokerageImportRequestRepository;
        private readonly IFspeImportIntegrationService _fspeImportIntegrationService;
        private readonly IWizardService _wizardService;

        public BrokerageFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<broker_Brokerage> brokerageRepository,
            IAuditWriter clientAuditWriter,
            IAuditLogV1Service auditLogService,
            IUserService userService,
            IFspeService fspeService,

            IRepository<product_ProductOption> productOptionRepository,
            IRepository<broker_BrokerageProductOption> brokerageProductOptionRepository,
            IRepository<broker_Representative> representatives, IDocumentGeneratorService documentGeneratorService,
            IRepository<broker_BrokerageFscaLicenseCategory> brokerLicenseCategoryRepo,
            IRepository<broker_BrokerageRepresentative> brokerageRepresentativeRepository,
            IRepository<client_OrganisationOptionItemValue> organisationOptionItemValueRepository,

            ISendEmailService sendEmailService,
            IConfigurationService configurationService,
            IRepository<broker_BrokerageImportRequest> brokerBrokerageImportRequestRepository,
            IFspeImportIntegrationService fspeImportIntegrationService,
            IWizardService wizardService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _brokerageRepository = brokerageRepository;
            _auditWriter = clientAuditWriter;
            _fspeService = fspeService;
            _representativeRepository = representatives;
            _documentGeneratorService = documentGeneratorService;
            _brokerLicenseCategoryRepo = brokerLicenseCategoryRepo;
            _brokerageRepresentativeRepository = brokerageRepresentativeRepository;
            _organisationOptionItemValueRepository = organisationOptionItemValueRepository;
            _userService = userService;
            _productOptionRepository = productOptionRepository;
            _brokerageProductOptionRepository = brokerageProductOptionRepository;
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _fspeImportIntegrationService = fspeImportIntegrationService;
            _brokerBrokerageImportRequestRepository = brokerBrokerageImportRequestRepository;
            _wizardService = wizardService;
        }

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        private const string ProductOptionConfigurationOptionLevel = "PolicyOption";

        public async Task<Brokerage> GetBrokerage(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _brokerageRepository
                    .SingleAsync(s => s.Id == id, $"Could not find a brokerage with the id {id}");
                await LoadReferenceData(entity);

                await _auditWriter.AddLastViewed<broker_Brokerage>(id);
                var mapped = Mapper.Map<Brokerage>(entity);
                return mapped;
            }
        }

        public async Task<Brokerage> GetBrokerageBasicReferenceData(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _brokerageRepository.FirstOrDefaultAsync(s => s.Id == id);
                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageNotes);
                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageContacts);
                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageBankAccounts);
                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageAddresses);

                return Mapper.Map<Brokerage>(entity);
            }
        }

        public async Task<Brokerage> GetBrokerageByFSPNumber(string fspNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _brokerageRepository
                    .Where(s => s.FspNumber == fspNumber).FirstOrDefaultAsync();
                var mapped = Mapper.Map<Brokerage>(entity);
                return mapped;
            }
        }

        private async Task<List<ProductOption>> GetProductOptions(List<int> list)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var options = await _productOptionRepository
                    .Where(po => !po.IsDeleted && list.Contains(po.Id))
                    .ToListAsync();
                return Mapper.Map<List<ProductOption>>(options);
            }
        }

        public async Task<List<Brokerage>> GetBrokerages()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerages = await _brokerageRepository
                    .Where(brokerage => !brokerage.IsDeleted).OrderBy(brokerage => brokerage.Name)
                    .ToListAsync();

                return Mapper.Map<List<Brokerage>>(brokerages);
            }
        }

        public async Task EditBrokerage(Brokerage brokerage)
        {
            Contract.Requires(brokerage != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.EditBrokerage);
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _brokerageRepository.SingleAsync(s => s.Id == brokerage.Id, $"Could not find a brokerage with the id {brokerage.Id}");

                entity.IsAuthorised = brokerage.IsAuthorised;
                entity.StartDate = brokerage.StartDate.ToSaDateTime();
                entity.EndDate = brokerage.EndDate.ToSaDateTime();
                entity.IsActive = true;

                entity.TradeName = brokerage.TradeName;
                entity.FspWebsite = brokerage.FspWebsite;
                entity.MedicalAccreditationNo = brokerage.MedicalAccreditationNo;
                entity.TelNo = brokerage.TelNo;
                entity.FaxNo = brokerage.FaxNo;
                entity.FinYearEnd = brokerage.FinYearEnd;
                entity.RegNo = brokerage.RegNo;
                entity.BrokerageType = brokerage.BrokerageType;
                entity.FicaRiskRating = brokerage.FicaRiskRating;
                entity.FicaVerified = brokerage.FicaVerified;
                entity.VatRegistrationNumber = brokerage.VatRegistrationNumber;

                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageBrokerConsultants);
                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageProductOptions);
                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageContacts);
                await _brokerageRepository.LoadAsync(entity, r => r.OrganisationOptionItemValues);

                if (entity.Code.StartsWith("tba", StringComparison.OrdinalIgnoreCase))
                {
                    entity.Code = await GenerateFspCodeAsync();
                }

                // brokerage bank accounts
                var brokerageBankAccounts = Mapper.Map<List<broker_BrokerageBankAccount>>(brokerage.BrokerageBankAccounts);
                entity.BrokerageBankAccounts = brokerageBankAccounts;

                // brokerage contacts
                var brokerageContacts = Mapper.Map<List<broker_BrokerageContact>>(brokerage.Contacts);

                // remove missing contacts
                var contactsToRemove = entity.BrokerageContacts.Where(e => e.Id > 0 && !brokerage.Contacts.Where(r => r.Id > 0).Select(r => r.Id).Contains(e.Id));
                foreach (var i in contactsToRemove)
                {
                    i.IsDeleted = true;
                    brokerageContacts.Add(i);
                }

                entity.BrokerageContacts = brokerageContacts;

                // brokerage addresses
                var brokerageAddresses = Mapper.Map<List<broker_BrokerageAddress>>(brokerage.Addresses);
                entity.BrokerageAddresses = brokerageAddresses;

                // brokerage consultants
                var mappedConsultants = Mapper.Map<List<broker_BrokerageBrokerConsultant>>(brokerage.BrokerageBrokerConsultants);
                entity.BrokerageBrokerConsultants.Clear();//detach current children to avoid constraint violations
                entity.BrokerageBrokerConsultants = mappedConsultants;

                // detach current children to avoid constraint violations
                entity.BrokerageProductOptions.Clear();

                // delete all existing brokerageProductOptions
                await DeleteBrokerageProductOptions(brokerage.Id);

                // product options           
                entity.BrokerageProductOptions = new List<broker_BrokerageProductOption>();

                foreach (var option in brokerage.BrokerageProductOptions)
                {
                    option.Id = 0;
                    option.StartDate = option.StartDate.ToSaDateTime();
                    option.EndDate = option.EndDate.ToSaDateTime();
                    var brokerageProductOption = Mapper.Map<broker_BrokerageProductOption>(option);
                    entity.BrokerageProductOptions.Add(brokerageProductOption);
                }

                //add notes
                var mappedNotes = Mapper.Map<List<broker_BrokerageNote>>(brokerage.BrokerageNotes);
                mappedNotes.ForEach(c => entity.BrokerageNotes.Add(c));

                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageChecks);
                // add new brokerage checks
                var checksToAdd = brokerage.BrokerageChecks.Where(r => entity.BrokerageChecks.FirstOrDefault(a => a.ValidityChecksetId == r.ValidityChecksetId
                                                                                                            && a.BrokerageId == r.ItemId) == null);
                foreach (var checkItem in checksToAdd)
                {
                    entity.BrokerageChecks.Add(new broker_BrokerageCheck()
                    {
                        ValidityChecksetId = checkItem.ValidityChecksetId,
                        BrokerageId = checkItem.ItemId
                    });
                }

                // update brokerage checks
                var checksToUpdate = brokerage.BrokerageChecks.Where(r => entity.BrokerageChecks.FirstOrDefault(a => a.ValidityChecksetId == r.ValidityChecksetId
                                                                                                                && a.BrokerageId == r.ItemId) != null);
                foreach (var entry in checksToUpdate)
                {
                    var existingCheck = entity.BrokerageChecks.Single(i =>
                        i.ValidityChecksetId == entry.ValidityChecksetId && i.BrokerageId == entry.ItemId);
                    if (entry.IsChecked != existingCheck.IsChecked)
                    {
                        entity.BrokerageChecks.Single(i =>
                                i.ValidityChecksetId == entry.ValidityChecksetId && i.BrokerageId == entry.ItemId).IsChecked =
                            entry.IsChecked;
                    }
                }

                // brokerage OrganisationOptionItemValue
                // avoid duplicate
                brokerage.OrganisationOptionItemValues.ForEach(item => item.BrokerageId = entity.Id);
                var filteredOrganisationOptionItemValues = brokerage.OrganisationOptionItemValues.Where(r => (r.OrganisationOptionItemValueId == 0 &&
                                                                                                        !entity.OrganisationOptionItemValues.Any(x => x.ProductOptionOptionItemValueId == r.ProductOptionOptionItemValueId && x.BrokerageId == r.BrokerageId))
                                                                                                       || r.OrganisationOptionItemValueId > 0);

                if (filteredOrganisationOptionItemValues.Any())
                {
                    var organisationOptionItemValues = Mapper.Map<List<client_OrganisationOptionItemValue>>(filteredOrganisationOptionItemValues);
                    entity.OrganisationOptionItemValues = organisationOptionItemValues;
                }

                _brokerageRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<List<string>> ValidationCompany(string fspNumber, string registrationNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = new List<string>();
                var brokerage = await _brokerageRepository
                    .FirstOrDefaultAsync(s => s.RegNo == registrationNumber
                        && s.FspNumber != fspNumber
                        && !s.IsDeleted);
                if (brokerage != null)
                {
                    list.Add($"Registration number {registrationNumber} is already registered as company {brokerage.Name} with FSP number {fspNumber}");
                }

                var representatives = await _representativeRepository
                    .Where(s => s.IdNumber == registrationNumber && !s.IsDeleted)
                    .ToListAsync();
                await _representativeRepository.LoadAsync(representatives, s => s.BrokerageRepresentatives);
                var representativeEntities = Mapper.Map<List<Representative>>(representatives);
                foreach (var representative in representativeEntities)
                {
                    var brokerageRepresentative = representative.ActiveBrokerage;
                    if (brokerageRepresentative != null && !brokerageRepresentative.IsDeleted)
                    {
                        if (!brokerageRepresentative.EndDate.HasValue || brokerageRepresentative.EndDate.Value > DateTime.Today)
                        {
                            brokerage = await _brokerageRepository
                                .FirstOrDefaultAsync(s => s.Id.Equals(brokerageRepresentative.BrokerageId));
                            if (brokerage != null && !brokerage.IsDeleted)
                            {
                                if (!brokerage.FspNumber.Equals(fspNumber))
                                {
                                    //change request Requestor Name: Siobhon Custodio, disable this validation
                                    /*var msg = $"Representative {representative.FirstName} {representative.SurnameOrCompanyName} with ID {representative.IdNumber} is still active in {brokerage.Name} with FSP number {brokerage.FspNumber}";
                                    msg += brokerageRepresentative.EndDate.HasValue ? $" until {brokerageRepresentative.EndDate.Value.ToString("yyyy/MM/dd")}." : " with no end date specified.";
                                    if (!list.Contains(msg)) list.Add(msg);
                                    */
                                }
                            }
                        }
                    }
                }
                return list;
            }
        }

        public async Task<List<string>> ValidateRepresentatives(string fspNumber, List<Representative> representatives)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var list = new List<string>();

                var idNumbers = representatives.Select(s => s.IdNumber).ToList<string>();
                var data = await _representativeRepository
                .Where(s => idNumbers.Contains(s.IdNumber))
                .ToListAsync();
                await _representativeRepository.LoadAsync(data, s => s.BrokerageRepresentatives);
                var representativeEntities = Mapper.Map<List<Representative>>(data);
                foreach (var representative in representativeEntities)
                {
                    var brokerageRepresentative = representative.ActiveBrokerage;
                    if (brokerageRepresentative != null && !brokerageRepresentative.IsDeleted)
                    {
                        if (!brokerageRepresentative.EndDate.HasValue || brokerageRepresentative.EndDate.Value > DateTime.Today)
                        {
                            var brokerage = await _brokerageRepository
                            .FirstOrDefaultAsync(s => s.Id.Equals(brokerageRepresentative.BrokerageId));
                            if (brokerage != null && !brokerage.IsDeleted)
                            {
                                if (!brokerage.FspNumber.Equals(fspNumber))
                                {
                                    //change request Requestor Name: Siobhon Custodio, disable this validation
                                    /*
                                    var msg = $"Representative {representative.FirstName} {representative.SurnameOrCompanyName} with ID {representative.IdNumber} is still active in {brokerage.Name} with FSP number {brokerage.FspNumber}";
                                    msg += brokerageRepresentative.EndDate.HasValue ? $" until {brokerageRepresentative.EndDate.Value.ToString("yyyy/MM/dd")}." : " with no end date specified.";
                                    if (!list.Contains(msg)) list.Add(msg);
                                    */
                                }
                            }
                        }
                    }
                }
                return list;
            }
        }

        private async Task DeleteBrokerageProductOptions(int brokerageId)
        {
            if (brokerageId <= 0)
            {
                return;
            }

            var list = await _brokerageProductOptionRepository
            .Where(bpo => bpo.BrokerageId == brokerageId)
            .ToListAsync();
            _brokerageProductOptionRepository.Delete(list);
        }

        public async Task<PagedRequestResult<Brokerage>> SearchBrokerages(PagedRequest request, bool isBinderPartnerSearch)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            var brokerageType = isBinderPartnerSearch ? BrokerageTypeEnum.BinderPartner : BrokerageTypeEnum.Brokerage;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerages = await _brokerageRepository
                .Where(brokerage => brokerage.IsAuthorised && (brokerage.BrokerageType == brokerageType || brokerage.BrokerageType == BrokerageTypeEnum.BinderPartnerAndBrokerage) && (string.IsNullOrEmpty(request.SearchCriteria)
                   || (brokerage.Name.Contains(request.SearchCriteria)
                   || brokerage.FspNumber.Contains(request.SearchCriteria)
                   || brokerage.RegNo.Contains(request.SearchCriteria.Replace("%2F", "/"))
                   || brokerage.Code.Contains(request.SearchCriteria))))
                .ToPagedResult<broker_Brokerage, Brokerage>(request);

                return brokerages;
            }
        }

        public async Task RefreshFspData()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled("NewBrokerOnboardingProcess"))
            {
                _ = await _fspeImportIntegrationService.GetAllFromSubscriptionListAsync();
                await ProcessFSPFailedImportResponse();
                // await RefreshActiveFspDetails();
            }
            else
            {
                await RefreshBrokerageData();
            }
        }

        private async Task RefreshBrokerageData()
        {
            List<string> brokerageFsp;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                brokerageFsp = await _brokerageRepository.Where(b => b.IsActive).Select(b => b.FspNumber).ToListAsync();
            }

            var fsbDetails = await _fspeService.GetFspDetails(brokerageFsp);

            foreach (var fspNumber in brokerageFsp)
            {
                try
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var entity = await _brokerageRepository.FirstOrDefaultAsync(b => b.FspNumber == fspNumber);
                        Fsp fspDetail = fsbDetails.First(d => d.FspNumber == fspNumber);

                        //Map into an existing item
                        Mapper.Map(fspDetail, entity);

                        entity.BrokerageRepresentatives = new List<broker_BrokerageRepresentative>();
                        var representatives = Mapper.Map<List<broker_Representative>>(fspDetail.Representatives);
                        var keyIndividuals = Mapper.Map<List<broker_Representative>>(fspDetail.KeyIndividuals);
                        var soleProps = Mapper.Map<List<broker_Representative>>(fspDetail.SoleProprietors);
                        representatives?.ForEach(async d => await GetBrokerRepresentative(d, entity, RepRoleEnum.Representative));
                        keyIndividuals?.ForEach(async d => await GetBrokerRepresentative(d, entity, RepRoleEnum.KeyIndividual));
                        soleProps?.ForEach(async d => await GetBrokerRepresentative(d, entity, RepRoleEnum.SoleProprietor));

                        _brokerageRepository.Update(entity);
                        await scope.SaveChangesAsync();
                    }
                }
                catch (Exception e)
                {
                    e.LogException();
                }
            }
        }

        public async Task<List<Lookup>> GetBrokeragesByCoverTypeIds(List<int> coverTypeIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            if (coverTypeIds == null)
            {
                return new List<Lookup>();
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResult = await _brokerageRepository.SqlQueryAsync<Lookup>(
                DatabaseConstants.BrokeragesByCoverTypeIdsSP,
                new SqlParameter("CoverTypeIds", string.Join(",", coverTypeIds.ToArray())));

                return searchResult;
            }
        }

        public async Task<Brokerage> GetFspFromFsb(string fspNumber, bool wizardRequest, string brokercode)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _brokerageRepository.FirstOrDefaultAsync(b => b.FspNumber == fspNumber);
                if (entity != null && wizardRequest && entity.IsActive)
                {
                    throw new BusinessException("Fsp number already exist in database.");
                }

                if (entity != null && (!wizardRequest || !entity.IsActive))
                {
                    await LoadReferenceData(entity);
                    return Mapper.Map<Brokerage>(entity);
                }

                var fsp = await _fspeService.GetFspDetails(new List<string>() { fspNumber });
                if (fsp.Count == 0)
                {
                    throw new BusinessException($"Fsp {fspNumber} is not Registered");
                }

                var fspDetail = fsp.First();

                if (fspDetail.Status != "Authorized")
                {
                    throw new BusinessException("Fsp Status is not Authorized");
                }

                entity = Mapper.Map<broker_Brokerage>(fspDetail);
                entity.PaymentFrequency = PaymentFrequencyEnum.Monthly;
                entity.PaymentMethod = PaymentMethodEnum.EFT;
                entity.IsActive = false;
                if (entity.BrokerageContacts != null)
                {
                    foreach (var contact in entity.BrokerageContacts)
                    {
                        if (!string.IsNullOrEmpty(contact.LastName) && string.IsNullOrEmpty(contact.TelephoneNumber))
                        {
                            contact.TelephoneNumber = entity.TelNo;
                        }
                    }
                }

                if (wizardRequest)
                {
                    entity.IsActive = false;
                }

                entity.BrokerageRepresentatives = new List<broker_BrokerageRepresentative>();

                var representatives = Mapper.Map<List<broker_Representative>>(fspDetail.Representatives);
                var keyIndividuals = Mapper.Map<List<broker_Representative>>(fspDetail.KeyIndividuals);
                var soleProps = Mapper.Map<List<broker_Representative>>(fspDetail.SoleProprietors);

                if (representatives != null)
                {
                    foreach (var d in representatives)
                    {
                        await GetBrokerRepresentative(d, entity, RepRoleEnum.Representative);
                    }
                }

                if (keyIndividuals != null)
                {
                    foreach (var d in keyIndividuals)
                    {
                        await GetBrokerRepresentative(d, entity, RepRoleEnum.KeyIndividual);
                    }
                }

                if (soleProps != null)
                {
                    foreach (var d in soleProps)
                    {
                        await GetBrokerRepresentative(d, entity, RepRoleEnum.SoleProprietor);
                    }
                }

                entity.Code = brokercode;
                _brokerageRepository.Create(entity);
                await scope.SaveChangesAsync();
                entity.BrokerageRepresentatives = null;

                entity.BrokerageFscaLicenseCategories = await _brokerLicenseCategoryRepo.Where(r => r.BrokerageId == entity.Id).Include(d => d.FscaLicenseCategory).ToListAsync();
                return Mapper.Map<Brokerage>(entity);
            }
        }

        public async Task<PagedRequestResult<BrokerConsultant>> GetBrokerConsultants(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var users = await _userService.GetUsersInRolePaged(request);
                var mapped = Mapper.Map<PagedRequestResult<BrokerConsultant>>(users);
                return mapped;
            }
        }

        private async Task LoadReferenceData(broker_Brokerage entity)
        {
            await _brokerageRepository.LoadAsync(entity, r => r.BrokerageNotes);
            await _brokerageRepository.LoadAsync(entity, r => r.BrokerageContacts);
            await _brokerageRepository.LoadAsync(entity, r => r.BrokerageBankAccounts);

            // return only one bank account
            var brokerageBankAccount = entity.BrokerageBankAccounts?.Where(x => !x.IsDeleted).OrderBy(x => x.Id).LastOrDefault();
            entity.BrokerageBankAccounts.Clear();
            if (brokerageBankAccount != null)
            {
                entity.BrokerageBankAccounts.Add(brokerageBankAccount);
            }

            await _brokerageRepository.LoadAsync(entity, r => r.BrokerageAddresses);

            var brokerageAddressList = entity.BrokerageAddresses.GroupBy(r => r.AddressType).Select(grp => grp.Last()).ToList();
            entity.BrokerageAddresses = brokerageAddressList;

            await _brokerageRepository.LoadAsync(entity, r => r.BrokerageBrokerConsultants);

            await _brokerageRepository.LoadAsync(entity, r => r.BrokerageProductOptions);
            await _brokerageProductOptionRepository.LoadAsync(entity.BrokerageProductOptions, r => r.ProductOption);

            var brokeragesReps = await _brokerageRepresentativeRepository.Where(r => r.BrokerageId == entity.Id).ToListAsync();
            await _brokerageRepresentativeRepository.LoadAsync(brokeragesReps, r => r.Representative);
            entity.BrokerageRepresentatives = brokeragesReps;
            await _brokerageRepository.LoadAsync(entity, r => r.BrokerageChecks);

            var brokerLicenseCategoryList = await _brokerLicenseCategoryRepo.Where(r => r.BrokerageId == entity.Id).Include(d => d.FscaLicenseCategory).ToListAsync();
            entity.BrokerageFscaLicenseCategories = brokerLicenseCategoryList.GroupBy(r => r.FscaLicenseCategoryId).Select(grp => grp.First()).ToList();

            await _brokerageRepository.LoadAsync(entity, r => r.OrganisationOptionItemValues);
        }

        private async Task GetBrokerRepresentative(broker_Representative rep, broker_Brokerage brokerage, RepRoleEnum role)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {

                DateTime? startDateTime = null;
                if (role == RepRoleEnum.KeyIndividual)
                {
                    startDateTime = DateTimeHelper.SaNow;
                }
                var existingLoaded = _representativeRepository.FirstOrDefault(r => r.IdNumber == rep.IdNumber && r.IdType == rep.IdType);

                if (existingLoaded == null)
                {

                    var current = brokerage.BrokerageRepresentatives.FirstOrDefault(r => r.Representative.IdNumber == rep.IdNumber && r.Representative.IdType == rep.IdType);
                    if (current != null)
                    {
                        var existing = current.Representative;
                        if (existing.Code == "temp")
                        {
                            if (existing.RepType != null)
                            {
                                existing.Code = await GenerateRepCodeAsync(existing.RepType.Value);
                            }
                        }

                        brokerage.BrokerageRepresentatives.Add(new broker_BrokerageRepresentative()
                        {
                            Representative = existing,
                            StartDate = startDateTime,
                            EndDate = null,
                            RepRole = role,
                            BrokerageId = brokerage.Id
                        });
                    }
                    else
                    {

                        rep.Code = rep.RepType != null ? await GenerateRepCodeAsync(rep.RepType.Value) : "temp";

                        rep.RepresentativeFscaLicenseCategories.ForEach(a => a.BrokerageId = brokerage.Id);

                        brokerage.BrokerageRepresentatives.Add(new broker_BrokerageRepresentative()
                        {
                            Representative = rep,
                            StartDate = startDateTime,
                            EndDate = null,
                            RepRole = role,
                            BrokerageId = brokerage.Id

                        });
                    }
                }
                else
                {
                    await _representativeRepository.LoadAsync(existingLoaded, a => a.RepresentativeFscaLicenseCategories);

                    brokerage.BrokerageRepresentatives.Add(new broker_BrokerageRepresentative()
                    {
                        Representative = existingLoaded,
                        StartDate = startDateTime,
                        EndDate = null,
                        RepRole = role,
                        BrokerageId = brokerage.Id
                    });


                }
            }

        }

        private async Task<string> GenerateRepCodeAsync(RepTypeEnum rep)
        {
            return rep == RepTypeEnum.Natural
                ? await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.NaturalRep, "")
                : await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.JuristicRep, "");
        }

        private async Task<string> GenerateFspCodeAsync()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Brokerage, "");
        }

        public void ChangeTheNameWizard(string data)
        {
            string datas = data;
        }

        public async Task<BrokerageBankAccount> GetBrokerageBankAccount(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            var brokerageBankAccount = new broker_BrokerageBankAccount();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _brokerageRepository
                .SingleAsync(s => s.Id == id && s.IsDeleted == false, $"Could not find a Brokerage Bank Account with the id {id}");

                await _brokerageRepository.LoadAsync(entity, r => r.BrokerageBankAccounts);
                brokerageBankAccount = entity.BrokerageBankAccounts.Where(a => a.IsDeleted == false).LastOrDefault();
            }
            return Mapper.Map<BrokerageBankAccount>(brokerageBankAccount);
        }

        public async Task<RepresentativeBankAccount> GetRepresentativeBankAccount(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewRepresentative);
            }

            var RepresentativeBankAccount = new broker_RepresentativeBankAccount();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _representativeRepository
                .SingleAsync(s => s.Id == id && s.IsDeleted == false, $"Could not find a Representative Bank Account with the id {id}");
                await _representativeRepository.LoadAsync(entity, r => r.RepresentativeBankAccounts);
                RepresentativeBankAccount = entity.RepresentativeBankAccounts.Where(r => r.IsDeleted == false).LastOrDefault();
            }
            return Mapper.Map<RepresentativeBankAccount>(RepresentativeBankAccount);
        }

        public async Task<Brokerage> GetBrokerageWithoutReferenceData(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _brokerageRepository
                    .SingleAsync(s => s.Id == id, $"Could not find a brokerage with the id {id}");
                return Mapper.Map<Brokerage>(entity);
            }
        }

        public async Task<List<Brokerage>> GetBrokerageAndContactByIds(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _brokerageRepository
                .Where(c => ids.Contains(c.Id)).ToListAsync();
                await _brokerageRepository.LoadAsync(entities, c => c.BrokerageContacts);
                var mapped = Mapper.Map<List<Brokerage>>(entities);
                return mapped;
            }
        }

        public async Task<bool> SendBrokerageWelcomeLetter(Brokerage brokerage)
        {
            if (brokerage?.Contacts?.Count > 0)
            {
                var contact = brokerage.Contacts.Find(a => a.ContactType == ContactTypeEnum.BrokerContact && !string.IsNullOrEmpty(a.Email));
                if (contact != null)
                {
                    var emailBody = await _configurationService.GetModuleSetting(SystemSettings.BrokerageWelcomeLetterEmailBody);
                    var fromAddress = await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);

                    await _sendEmailService.SendEmail(new SendMailRequest
                    {
                        ItemId = brokerage.Id,
                        ItemType = "Brokerage",
                        FromAddress = fromAddress,
                        Recipients = contact.Email,
                        Subject = "Welcome Letter",
                        Body = emailBody.Replace("{0}", brokerage.Name).Replace("{1}", ""),
                        IsHtml = true,
                        Attachments = await GetBrokerageWelcomeLetterByBrokerageId(brokerage.Id)
                    });
                }
            }

            return await Task.FromResult(true);
        }

        private async Task<MailAttachment[]> GetBrokerageWelcomeLetterByBrokerageId(int brokerageId)
        {
            var mailAttachments = new List<MailAttachment>();

            if (brokerageId > 0)
            {
                var reportserverUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.ClientCare.Brokerage";

                var parameters = $"&brokerageId={brokerageId}&rs:Command=ClearSession";
                var brokerageWelcomeLetter = await GetUriDocumentByteData(new Uri($"{reportserverUrl}/RMABrokerageWelcomeLetter{parameters}&rs:Format=PDF"), null);
                if (brokerageWelcomeLetter != null)
                {
                    mailAttachments.Add(new MailAttachment { AttachmentByteData = brokerageWelcomeLetter, FileName = "WelcomeLetter.pdf", FileType = "application/pdf" });
                }
            }

            return mailAttachments.ToArray();
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        public async Task<Brokerage> GetBrokerageImportRequestDetails(string fspNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _brokerageRepository.FirstOrDefaultAsync(b => b.FspNumber == fspNumber);

                if (entity?.IsActive == true || entity?.IsAuthorised == true)
                {
                    throw new BusinessException($"BR0001: Fsp {fspNumber} has already been imported");
                }

                if (entity?.IsActive == false)
                {
                    await LoadReferenceData(entity);
                    return Mapper.Map<Brokerage>(entity);
                }

                var importRequest = await _brokerBrokerageImportRequestRepository.Where(s => s.FspNumber == fspNumber.ToLower()).OrderByDescending(o => o.RequestDate).FirstOrDefaultAsync();
                if (importRequest?.BrokerImportRequestId > 0)
                {
                    var expiryTime = await _configurationService.GetModuleSetting(SystemSettings.FSPERequestElapsedExpiry);

                    TimeSpan span = DateTimeHelper.SaNow.Subtract(importRequest.RequestDate);
                    if (span.TotalMinutes < int.Parse(expiryTime))
                    {
                        throw new BusinessException($"BR0001: Fsp {fspNumber} has an Active Import Request sent on '{importRequest.RequestDate}' by '{importRequest.CreatedBy}'.");
                    }
                }
            }
            throw new BusinessException($"BR0002: Fsp {fspNumber} does not exist, please import fsp");
        }

        public async Task<bool> SubmitFSPDataImportRequest(BrokerageRepresentativeRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.AddBrokerage);
            }

            if (request == null)
            {
                throw new BusinessException("FSP Import Request is null or empty!");
            }

            List<FSPSubscription> subscriptionList = new List<FSPSubscription>
            {
                new FSPSubscription()
                {
                    FSPReference = request.FspNumber,
                    IDNumbers = request.RepresentativeIdNumbers?.ToArray()
                }
            };

            try
            {
                using (var _scope = _dbContextScopeFactory.Create())
                {
                    var response = await _fspeImportIntegrationService.SubmitSubscriptionListAsync(subscriptionList);
                    int requestStatusCode = int.TryParse(response.StatusCode, out requestStatusCode) ? requestStatusCode : 0;
                    var brokerageImportRequest = new broker_BrokerageImportRequest()
                    {
                        IsProcessed = false,
                        FspNumber = request.FspNumber.ToLower(),
                        RepresentativeIdNumbers = string.Join(",", request.RepresentativeIdNumbers),
                        RequestDate = DateTimeHelper.SaNow,
                        RequestMessage = response.Message,
                        RequestStatusCode = requestStatusCode,
                        RequestUserReference = response.UserReference,
                        RequestSubscriptionName = response.SubscriptionListName,
                        IsDeleted = false,
                        CreatedBy = RmaIdentity.Email,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedBy = RmaIdentity.Email,
                        ModifiedDate = DateTimeHelper.SaNow,
                        BrokerageType = request.BrokerageType
                    };

                    _brokerBrokerageImportRequestRepository.Create(brokerageImportRequest);

                    await _scope.SaveChangesAsync();

                    return true;
                }
            }
            catch (Exception e)
            {
                throw new BusinessException(e.Message);
            }
        }

        public async Task<bool> ProcessFSPDataImportResponseList(List<Fsp> fsps)
        {
            var notificationList = new List<Notification>();
            var refreshFspDataList = new List<Fsp>();

            if (fsps?.Count > 0)
            {
                foreach (var fsp in fsps)
                {
                    var importRequest = new broker_BrokerageImportRequest();
                    bool exists = false;
                    using (var _scope = _dbContextScopeFactory.Create())
                    {
                        importRequest = await _brokerBrokerageImportRequestRepository
                            .Where(s => s.FspNumber == fsp.FspNumber)
                            .OrderByDescending(d => d.BrokerImportRequestId)
                            .FirstOrDefaultAsync();
                        if (importRequest?.BrokerImportRequestId > 0)
                        {
                            importRequest.IsProcessed = true;
                            importRequest.ResponseDate = DateTimeHelper.SaNow;
                            importRequest.ReponseMessage = fsp.Status;
                            importRequest.ModifiedBy = RmaIdentity.Username;
                            importRequest.ModifiedDate = DateTimeHelper.SaNow;

                            _brokerBrokerageImportRequestRepository.Update(importRequest);

                            var notificationMessage = await _configurationService.GetModuleSetting(SystemSettings.FSPESucessNotification);
                            notificationMessage = notificationMessage.Replace("{0}", importRequest.FspNumber).Replace("{1}", importRequest.CreatedBy);

                            var notification = new Notification()
                            {
                                Title = importRequest.BrokerageType == BrokerageTypeEnum.Brokerage ? "Brokerage Onboarding" : "Binder Partner Onboarding",
                                Message = $"{fsp.Status}: {notificationMessage}",
                                ActionLink = "clientcare/broker-manager",
                                HasBeenReadAndUnderstood = true
                            };

                            notificationList.Add(notification);
                        }

                        var brokerage = await _brokerageRepository
                            .FirstOrDefaultAsync(b => b.FspNumber == fsp.FspNumber);
                        exists = brokerage?.Id > 0;
                        if (brokerage == null)
                        {
                            var entity = await CreateFSPEntityAsync(fsp);
                            entity.BrokerageType = importRequest.BrokerageType == BrokerageTypeEnum.Brokerage
                                ? BrokerageTypeEnum.Brokerage : BrokerageTypeEnum.BinderPartner;
                            _brokerageRepository.Create(entity);
                        }
                        else if (!refreshFspDataList.Any(f => f.FspNumber == fsp.FspNumber))
                        {
                            refreshFspDataList.Add(fsp);
                        }
                        await _scope.SaveChangesAsync();
                    }
                }

                if (notificationList?.Count > 0)
                {
                    await SendNotifications(notificationList);
                }

                if (refreshFspDataList?.Count > 0)
                {
                    await RefreshLocalFspData(refreshFspDataList);
                }
            }

            return notificationList.Count > 0 || refreshFspDataList.Count > 0;
        }

        public async Task ProcessFSPDataImportResponse(string claimCheckReference)
        {
            if (string.IsNullOrEmpty(claimCheckReference))
            {
                return;
            }

            var fsps = await _fspeImportIntegrationService.ProcessFSPDataImportResponseAsync(claimCheckReference);
            _ = await ProcessFSPDataImportResponseList(fsps);
        }

        private async Task<broker_Brokerage> CreateFSPEntityAsync(Fsp fsp)
        {
            var entity = Mapper.Map<broker_Brokerage>(fsp);
            entity.PaymentFrequency = PaymentFrequencyEnum.Monthly;
            entity.PaymentMethod = PaymentMethodEnum.EFT;
            entity.IsActive = false;
            if (entity.BrokerageContacts != null)
            {
                foreach (var contact in entity.BrokerageContacts)
                {
                    if (!string.IsNullOrEmpty(contact.LastName) && string.IsNullOrEmpty(contact.TelephoneNumber))
                    {
                        contact.TelephoneNumber = entity.TelNo;
                    }
                }
            }

            entity.BrokerageRepresentatives = new List<broker_BrokerageRepresentative>();

            var representatives = Mapper.Map<List<broker_Representative>>(fsp.Representatives);
            var keyIndividuals = Mapper.Map<List<broker_Representative>>(fsp.KeyIndividuals);
            var soleProps = Mapper.Map<List<broker_Representative>>(fsp.SoleProprietors);

            if (representatives != null)
            {
                foreach (var d in representatives)
                {
                    await GetBrokerRepresentative(d, entity, RepRoleEnum.Representative);
                }
            }

            if (keyIndividuals != null)
            {
                foreach (var d in keyIndividuals)
                {
                    await GetBrokerRepresentative(d, entity, RepRoleEnum.KeyIndividual);
                }
            }

            if (soleProps != null)
            {
                foreach (var d in soleProps)
                {
                    await GetBrokerRepresentative(d, entity, RepRoleEnum.SoleProprietor);
                }
            }

            var brokerCode = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.TemporaryBrokerage, "");
            entity.Code = brokerCode;
            return entity;
        }

        private async Task ProcessFSPFailedImportResponse()
        {
            var expiryTime = await _configurationService.GetModuleSetting(SystemSettings.FSPERequestElapsedExpiry);
            var notificationList = new List<Notification>();
            using (var _scope = _dbContextScopeFactory.Create())
            {
                var importRequestList = await _brokerBrokerageImportRequestRepository.Where(s => s.IsProcessed == false).ToListAsync();
                foreach (var importRequest in importRequestList)
                {
                    TimeSpan span = DateTimeHelper.SaNow.Subtract(importRequest.RequestDate);
                    if (span.TotalMinutes > int.Parse(expiryTime))
                    {
                        importRequest.IsProcessed = true;
                        importRequest.ResponseDate = DateTimeHelper.SaNow;
                        importRequest.ReponseMessage = "FSP Data not received within set time period";
                        importRequest.ModifiedBy = RmaIdentity.Username;
                        importRequest.ModifiedDate = DateTimeHelper.SaNow;

                        _brokerBrokerageImportRequestRepository.Update(importRequest);

                        var notification = new Notification()
                        {
                            Title = "FSP Data Import",
                            Message = $"Data import for FSP ({importRequest.FspNumber}) not received within set time period.",
                            ActionLink = "clientcare/broker-manager",
                            HasBeenReadAndUnderstood = true
                        };
                        notificationList.Add(notification);
                    }
                }
                await _scope.SaveChangesAsync();

                if (notificationList?.Count > 0)
                {
                    await SendNotifications(notificationList);
                }
            }
        }

        private async Task SendNotifications(List<Notification> notificationList)
        {
            try
            {
                string[] fspeNotificationRecepients = (await _configurationService.GetModuleSetting(SystemSettings.FSPENotificationRecepients)).Split('|');
                foreach (var (email, notification) in fspeNotificationRecepients.SelectMany(email => notificationList.Select(notification => (email, notification))))
                {
                    await _wizardService.SendWizardNotification("fspe-import-notification", notification.Title, notification.Message, notification.ActionLink, -1, email);
                }
            }
            catch (Exception e)
            {

                e.LogException();
            }
        }

        private async Task RefreshLocalFspData(List<Fsp> fsps)
        {
            foreach (var fsp in fsps)
            {
                var fspNumber = fsp.FspNumber;
                try
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var entity = await _brokerageRepository.FirstOrDefaultAsync(b => b.FspNumber == fspNumber);
                        Fsp fspDetail = fsps.First(d => d.FspNumber == fspNumber);

                        fspDetail.ContactPerson = null;
                        fspDetail.Categories = null;

                        //Map into an existing item
                        Mapper.Map(fspDetail, entity);

                        entity.BrokerageRepresentatives = new List<broker_BrokerageRepresentative>();
                        var representatives = Mapper.Map<List<broker_Representative>>(fsp.Representatives);
                        var keyIndividuals = Mapper.Map<List<broker_Representative>>(fsp.KeyIndividuals);
                        var soleProps = Mapper.Map<List<broker_Representative>>(fsp.SoleProprietors);
                        representatives?.ForEach(async d => await MapBrokerRepresentative(d, entity, RepRoleEnum.Representative));
                        keyIndividuals?.ForEach(async d => await MapBrokerRepresentative(d, entity, RepRoleEnum.KeyIndividual));
                        soleProps?.ForEach(async d => await MapBrokerRepresentative(d, entity, RepRoleEnum.SoleProprietor));

                        _brokerageRepository.Update(entity);
                        await scope.SaveChangesAsync();
                    }
                }
                catch (Exception e)
                {
                    e.LogException();
                }
            }
        }

        private async Task RefreshActiveFspDetails()
        {
            List<Brokerage> fsps = new List<Brokerage>();
            List<FSPSubscription> subscriptionList = new List<FSPSubscription>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerages = await _brokerageRepository
                    .Where(b => b.IsActive)
                    .ToListAsync();

                _ = Mapper.Map(brokerages, fsps);
            }

            subscriptionList.AddRange(fsps.Select(fsp => new FSPSubscription()
            {
                FSPReference = fsp.FspNumber,
                IDNumbers = new[] { String.Join(",", fsp.Id.ToString()) }
            }));

            if (subscriptionList?.Count > 0)
            {
                _ = await _fspeImportIntegrationService.SubmitSubscriptionListAsync(subscriptionList);
            }
        }

        public async Task GetAllFromSubscriptionList()
        {
            _ = await _fspeImportIntegrationService.GetAllFromSubscriptionListAsync();
        }

        public async Task<Brokerage> GetBrokerageByUserId(int userId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var brokerageId = (await _userService.GetMemberBrokerageList(userId)).Select(a => a.BrokerageId).FirstOrDefault();
                var brokerage = await _brokerageRepository.FirstOrDefaultAsync(b => b.Id == brokerageId);
                await LoadReferenceData(brokerage);

                return Mapper.Map<Brokerage>(brokerage);
            }
        }

        public async Task<List<string>> GetBrokeragesWithAllOption()
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResult = await _brokerageRepository.SqlQueryAsync<string>(
                DatabaseConstants.GetBrokerNamesWithAllOption);

                return searchResult;
            }
        }

        private async Task MapBrokerRepresentative(broker_Representative rep, broker_Brokerage brokerage, RepRoleEnum role)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {

                DateTime? startDateTime = null;
                if (role == RepRoleEnum.KeyIndividual)
                {
                    startDateTime = DateTimeHelper.SaNow;
                }
                var existingLoaded = _representativeRepository.FirstOrDefault(r => r.IdNumber == rep.IdNumber && r.IdType == rep.IdType);

                if (existingLoaded == null)
                {

                    var current = brokerage.BrokerageRepresentatives.FirstOrDefault(r => r.Representative.IdNumber == rep.IdNumber && r.Representative.IdType == rep.IdType);
                    if (current != null)
                    {
                        var existing = current.Representative;
                        if (existing.Code == "temp")
                        {
                            if (existing.RepType != null)
                            {
                                existing.Code = await GenerateRepCodeAsync(existing.RepType.Value);
                            }
                        }

                        brokerage.BrokerageRepresentatives.Add(new broker_BrokerageRepresentative()
                        {
                            Representative = existing,
                            StartDate = startDateTime,
                            EndDate = null,
                            RepRole = role,
                            BrokerageId = brokerage.Id
                        });
                    }
                    else
                    {

                        rep.Code = rep.RepType != null ? await GenerateRepCodeAsync(rep.RepType.Value) : "temp";

                        rep.RepresentativeFscaLicenseCategories.ForEach(a => a.BrokerageId = brokerage.Id);

                        brokerage.BrokerageRepresentatives.Add(new broker_BrokerageRepresentative()
                        {
                            Representative = rep,
                            StartDate = startDateTime,
                            EndDate = null,
                            RepRole = role,
                            BrokerageId = brokerage.Id

                        });
                    }
                }
                else
                {
                    await _representativeRepository.LoadAsync(existingLoaded, a => a.RepresentativeFscaLicenseCategories);
                    var linked = await _brokerageRepresentativeRepository.FirstOrDefaultAsync(r => r.Representative.IdNumber == existingLoaded.IdNumber && r.Representative.IdType == existingLoaded.IdType);

                    if (linked == null)
                    {
                        brokerage.BrokerageRepresentatives.Add(new broker_BrokerageRepresentative()
                        {
                            Representative = existingLoaded,
                            StartDate = startDateTime,
                            EndDate = null,
                            RepRole = role,
                            BrokerageId = brokerage.Id
                        });
                    }
                }
            }

        }

        public async Task<Brokerage> GetBrokerageAndRepresentativesByFSPNumber(string fspNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _brokerageRepository
                    .Where(s => s.FspNumber == fspNumber).FirstOrDefaultAsync();

                if (entity?.Id > 0)
                {
                    var brokeragesReps = await _brokerageRepresentativeRepository.Where(r => r.BrokerageId == entity.Id).ToListAsync();
                    await _brokerageRepresentativeRepository.LoadAsync(brokeragesReps, r => r.Representative);
                    entity.BrokerageRepresentatives = brokeragesReps;
                }

                return Mapper.Map<Brokerage>(entity);
            }
        }

        public async Task<List<string>> GetBrokersLinkedtoClaims(string productOptionName)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            {
                RmaIdentity.DemandPermission(Permissions.ViewBrokerage);
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResult = await _brokerageRepository.SqlQueryAsync<string>(
                DatabaseConstants.GetBrokersLinkedtoClaims, new SqlParameter("@ProductOption", productOptionName));

                return searchResult;
            }
        }

        public async Task<Brokerage> GetBrokerageByUserEmail(string userEmail)
        {
            if (string.IsNullOrWhiteSpace(userEmail))
            {
                return null;
            }

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var userResult = await _userService.GetUserByEmail(userEmail);

                if (userResult == null)
                {
                    return null;
                }

                var brokerageId = (await _userService.GetMemberBrokerageList(userResult.Id)).Select(a => a.BrokerageId).FirstOrDefault();
                var brokerage = await _brokerageRepository.FirstOrDefaultAsync(b => b.Id == brokerageId);

                return Mapper.Map<Brokerage>(brokerage);
            }
        }

        public async Task<BrokerageModel> GetByFSPNumber(string fspNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _brokerageRepository
                             .Where(s => s.FspNumber == fspNumber).FirstOrDefaultAsync();

                if (entity?.Id > 0)
                {
                    var brokeragesReps = await _brokerageRepresentativeRepository.Where(r => r.BrokerageId == entity.Id).ToListAsync();
                    await _brokerageRepresentativeRepository.LoadAsync(brokeragesReps, r => r.Representative);
                }

                return Mapper.Map<BrokerageModel>(entity);
            }
        }

        public async Task<List<ProductOptionConfiguration>> GetProductOptionConfigurationsByOptionTypeId(int optionTypeId, int brokerageId, DateTime? effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var organisationOptionItemValues = await _organisationOptionItemValueRepository.Where(x => x.BrokerageId == brokerageId).ToListAsync();

                if (!effectiveDate.HasValue)
                {
                    effectiveDate = DateTimeHelper.SaNow;
                }

                var param = new SqlParameter { ParameterName = "@EffectiveDate", SqlDbType = System.Data.SqlDbType.DateTime, Value = effectiveDate };
                var productOptionOptionItemValues = await _brokerageRepository.SqlQueryAsync<ProductOptionConfiguration>(
                DatabaseConstants.GetProductOptionOptionItemValues, param);

                productOptionOptionItemValues = productOptionOptionItemValues.Where(x => x.OptionTypeId == optionTypeId).ToList();

                ProcessProductOptionConfigurations(productOptionOptionItemValues, organisationOptionItemValues);

                return productOptionOptionItemValues;
            }
        }

        public async Task<List<ProductOptionConfiguration>> GetProductOptionConfigurationsByBrokerageId(int brokerageId, DateTime? effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var organisationOptionItemValues = await _organisationOptionItemValueRepository.Where(x => x.BrokerageId == brokerageId).ToListAsync();

                if (!effectiveDate.HasValue)
                {
                    effectiveDate = DateTimeHelper.SaNow;
                }

                var param = new SqlParameter { ParameterName = "@EffectiveDate", SqlDbType = System.Data.SqlDbType.DateTime, Value = effectiveDate };
                var productOptionOptionItemValues = await _brokerageRepository.SqlQueryAsync<ProductOptionConfiguration>(
                DatabaseConstants.GetProductOptionOptionItemValues, param);

                productOptionOptionItemValues = productOptionOptionItemValues.Where(
                                                                x => organisationOptionItemValues.Any(r => x.ProductOptionOptionItemValueId != null && r.ProductOptionOptionItemValueId == x.ProductOptionOptionItemValueId) ||
                                                                organisationOptionItemValues.Any(r => x.BenefitOptionItemValueId != null && r.BenefitOptionItemValueId == x.BenefitOptionItemValueId)).ToList();

                ProcessProductOptionConfigurations(productOptionOptionItemValues, organisationOptionItemValues);

                return productOptionOptionItemValues;
            }
        }

        private void ProcessProductOptionConfigurations(List<ProductOptionConfiguration> productOptionConfigurations, List<client_OrganisationOptionItemValue> organisationOptionItemValues)
        {
            productOptionConfigurations.ForEach(x =>
            {
                var organisationOptionItem = organisationOptionItemValues.FirstOrDefault(r => x.ProductOptionOptionItemValueId != null && r.ProductOptionOptionItemValueId == x.ProductOptionOptionItemValueId);
                if (organisationOptionItem != null)
                {
                    x.OrganisationOptionItemValue = Mapper.Map<OrganisationOptionItemValue>(organisationOptionItem);
                }

                var organisationOptionItemForBenefitOption = organisationOptionItemValues.FirstOrDefault(r => x.BenefitOptionItemValueId != null && r.BenefitOptionItemValueId == x.BenefitOptionItemValueId);
                if (organisationOptionItemForBenefitOption != null)
                {
                    x.OrganisationOptionItemValue = Mapper.Map<OrganisationOptionItemValue>(organisationOptionItemForBenefitOption);
                }
            });
        }

        public async Task<List<ProductOptionConfiguration>> GetProductOptionConfigurationsByProductOptionId(int productOptionId, DateTime? effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (!effectiveDate.HasValue)
                {
                    effectiveDate = DateTimeHelper.SaNow;
                }

                var param = new SqlParameter { ParameterName = "@EffectiveDate", SqlDbType = System.Data.SqlDbType.DateTime, Value = effectiveDate };
                var productOptionOptionItemValues = await _brokerageRepository.SqlQueryAsync<ProductOptionConfiguration>(
                DatabaseConstants.GetProductOptionOptionItemValues, param);

                productOptionOptionItemValues = productOptionOptionItemValues.Where(x=> x.ProductOptionId == productOptionId
                                                              &&  x.OptionLevel == ProductOptionConfigurationOptionLevel).ToList();
           
                return productOptionOptionItemValues;
            }
        }
    }
}