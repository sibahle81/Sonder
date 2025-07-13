using AutoMapper;
using AutoMapper.QueryableExtensions;

using Microsoft.VisualBasic.FileIO;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class TargetAudienceFacade : RemotingStatelessService, ITargetAudienceService
    {

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IImportFileService _importFileService;
        private readonly IRepository<campaign_TargetAudience> _targetAudiencesRepository;
        private readonly IRepository<campaign_TargetCompany> _targetCompaniesRepository;
        private readonly IRepository<campaign_TargetPerson> _targetPersonsRepository;
        private readonly IUploadsService _uploadService;
        private readonly IMapper _mapper;

        public TargetAudienceFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_TargetAudience> targetAudiencesRepository,
            IRepository<campaign_TargetCompany> targetCompaniesRepository,
            IRepository<campaign_TargetPerson> targetPersonsRepository,
            IImportFileService importFileService,
            IUploadsService uploadService,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _targetAudiencesRepository = targetAudiencesRepository;
            _targetCompaniesRepository = targetCompaniesRepository;
            _targetPersonsRepository = targetPersonsRepository;
            _importFileService = importFileService;
            _uploadService = uploadService;
            _mapper = mapper;
        }

        public async Task<ImportFile> FindOrCreateImportFile(int campaignId, Guid token)
        {
            RmaIdentity.DemandPermission(Permissions.AddTargetAudience);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var importFile = await _importFileService.GetImportFile(token);
                if (importFile != null) return importFile;
                importFile = new ImportFile
                {
                    Id = 0,
                    CampaignId = campaignId,
                    FileToken = token,
                    RecordCount = 0,
                    ProcessedCount = 0,
                    RetryCount = 0,
                    Status = nameof(ImportStatus.Processing),
                    IsActive = true
                };
                importFile.Id = await _importFileService.AddImportFile(importFile);
                return importFile;
            }
        }

        public async Task<List<TargetAudience>> GetTargetAudiences(int campaignId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewTargetAudience);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var audience = await _targetAudiencesRepository
                    .Where(ta => ta.CampaignId == campaignId
                                 && ta.IsActive
                                 && !ta.IsDeleted)
                    .ProjectTo<TargetAudience>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return audience;
            }
        }

        public async Task<List<TargetAudience>> GetTargetAudienceByCampaignId(int campaignId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewTargetAudience);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var audiences = await _targetAudiencesRepository
                    .Where(ta => ta.CampaignId == campaignId
                                 && ta.IsActive
                                 && !ta.IsDeleted)
                    .ProjectTo<TargetAudience>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                var count = audiences.Count;
                for (var i = 0; i < count; i++)
                {
                    var audience = audiences[i];
                    switch (Enum.Parse(typeof(TargetAudienceType), audience.ItemType))
                    {
                        case TargetAudienceType.Client when audience.ItemId > 0:
                        case TargetAudienceType.Lead when audience.ItemId > 0:
                            break;
                        case TargetAudienceType.ClientType:
                        case TargetAudienceType.LeadClientType:
                            UpdateAudienceMember(ref audience, ClientTypeEnum.Affinity.ToString(), 0,
                                "", "",
                                "", "",
                                audience.Unsubscribed, false);
                            break;
                        case TargetAudienceType.Group:
                        case TargetAudienceType.Industry:
                        case TargetAudienceType.IndustryClass:
                        case TargetAudienceType.LeadIndustryClass:
                        case TargetAudienceType.WithProduct:
                        case TargetAudienceType.WithoutProduct:
                            break;
                        case TargetAudienceType.Client when audience.ItemId == 0:
                            UpdateAudienceMember(ref audience, "All clients", 0,
                                "", "",
                                "", "",
                                audience.Unsubscribed, false);
                            break;
                        case TargetAudienceType.Company:
                            var targetCompany = await _targetCompaniesRepository.FindByIdAsync(audience.ItemId);
                            if (targetCompany == null) break;
                            UpdateAudienceMember(ref audience, targetCompany.CompanyName, 3,
                                targetCompany.Email, targetCompany.MobileNumber,
                                targetCompany.MemberNumber, "",
                                audience.Unsubscribed, targetCompany.Unsubscribed);
                            break;
                        case TargetAudienceType.Person:
                            var targetPerson = await _targetPersonsRepository.FindByIdAsync(audience.ItemId);
                            if (targetPerson == null) break;
                            UpdateAudienceMember(ref audience, targetPerson.ContactName, 1,
                                targetPerson.Email, targetPerson.MobileNumber,
                                "", targetPerson.IdNumber,
                                audience.Unsubscribed, targetPerson.Unsubscribed);
                            break;
                        case TargetAudienceType.Lead when audience.ItemId == 0:
                            UpdateAudienceMember(ref audience, "All leads", 0,
                                "", "",
                                "", "",
                                audience.Unsubscribed, false);
                            break;
                        default:
                            UpdateAudienceMember(ref audience, $"{audience.ItemType}", 0,
                                "", "",
                                "", "",
                                audience.Unsubscribed, false);
                            break;
                    }
                    audiences[i] = audience;
                }
                return audiences;
            }
        }

        public async Task<TargetAudience> GetTargetAudience(int campaignId, string itemType, int itemId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewTargetAudience);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var audience = await _targetAudiencesRepository
                    .Where(
                        ta => ta.CampaignId == campaignId
                              && ta.ItemId == itemId
                              && ta.ItemType.Equals(itemType, StringComparison.OrdinalIgnoreCase))
                    .ProjectTo<TargetAudience>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync();
                return audience;
            }
        }

        public async Task<List<TargetPerson>> GetTargetPersons(List<int> personIds)
        {
            RmaIdentity.DemandPermission(Permissions.ViewTargetAudience);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var persons = await _targetPersonsRepository
                    .Where(p => personIds.Contains(p.Id)
                                && p.IsActive
                                && !p.IsDeleted)
                    .ProjectTo<TargetPerson>(_mapper.ConfigurationProvider)
                    .OrderBy(p => p.ContactName)
                    .ToListAsync();
                return persons;
            }
        }

        public async Task<List<TargetCompany>> GetTargetCompanies(List<int> companyIds)
        {
            RmaIdentity.DemandPermission(Permissions.ViewTargetAudience);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var companies = await _targetCompaniesRepository
                    .Where(c => companyIds.Contains(c.Id)
                                && c.IsActive
                                && !c.IsDeleted)
                    .ProjectTo<TargetCompany>(_mapper.ConfigurationProvider)
                    .OrderBy(c => c.CompanyName)
                    .ToListAsync();
                return companies;
            }
        }

        public Task<int> ImportAudience(ImportRequest request, ImportFile importFile)
        {
            Contract.Requires(request != null);
            Contract.Requires(importFile != null);
            RmaIdentity.DemandPermission(Permissions.AddTargetAudience);
            return ImportAudiences(request, importFile, new CancellationToken());
        }

        public async Task<int> AddCompanyTargetAudience(int campaignId, TargetCompany targetCompany)
        {
            Contract.Requires(targetCompany != null);
            RmaIdentity.DemandPermission(Permissions.AddTargetAudience);
            using (_dbContextScopeFactory.Create())
            {
                var id = await FindTargetCompanyId(targetCompany?.Email);
                if (id == 0)
                {
                    targetCompany.Id = await AddTargetCompany(targetCompany);
                }
                else
                {
                    targetCompany.Id = id;
                    await UpdateTargetCompany(_mapper.Map<campaign_TargetCompany>(targetCompany));
                }
                await AddCampaignTarget(campaignId, "Company", targetCompany.Id);
                return targetCompany.Id;
            }
        }

        public async Task<List<int>> AddTargetAudienceByList(List<TargetAudience> audiences)
        {
            Contract.Requires(audiences != null);
            RmaIdentity.DemandPermission(Permissions.AddTargetAudience);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var count = 0;
                var list = new List<int>();
                foreach (var audience in audiences)
                {
                    var dataAudience =
                        await FindTargetAudience(audience.CampaignId, audience.ItemType, audience.ItemId);
                    if (dataAudience == null)
                    {
                        audience.Id = 0;
                        dataAudience = audience;
                        var entity = _mapper.Map<campaign_TargetAudience>(dataAudience);
                        _targetAudiencesRepository.Create(entity);
                    }
                    else
                    {
                        dataAudience.Unsubscribed = audience.Unsubscribed;
                        dataAudience.IsActive = audience.IsActive;
                        dataAudience.IsDeleted = audience.IsDeleted;
                        dataAudience.ModifiedBy = audience.ModifiedBy;
                        dataAudience.ModifiedDate = audience.ModifiedDate;
                        var entity = _mapper.Map<campaign_TargetAudience>(dataAudience);
                        _targetAudiencesRepository.Update(entity);
                    }
                    if (audience.IsActive && !audience.IsDeleted) count++;
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                list.Add(count);
                return list;
            }
        }

        public async Task<int> AddTargetAudience(TargetAudience audience)
        {
            Contract.Requires(audience != null);
            RmaIdentity.DemandPermission(Permissions.AddTargetAudience);
            audience.ItemId = await SaveTargetAudienceMember(audience);
            audience.Id = await SaveTargetAudience(audience);
            return audience.Id;
        }

        private async Task<int> SaveTargetAudience(TargetAudience audience)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var targetAudience = _targetAudiencesRepository
                    .FirstOrDefault(a => a.CampaignId == audience.CampaignId
                                    && a.ItemType == audience.ItemType
                                    && a.ItemId == audience.ItemId);
                if (targetAudience == null)
                {
                    audience.Id = 0;
                    audience.IsActive = true;
                    audience.IsDeleted = false;
                    targetAudience = _mapper.Map<campaign_TargetAudience>(audience);
                    _targetAudiencesRepository.Create(targetAudience);
                }
                else
                {
                    targetAudience.IsActive = true;
                    targetAudience.IsDeleted = false;
                    targetAudience.Unsubscribed = audience.Unsubscribed;
                    _targetAudiencesRepository.Update(targetAudience);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return targetAudience.Id;
            }
        }

        private async Task<int> SaveTargetAudienceMember(TargetAudience audience)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                switch (audience.ItemType.ToLower())
                {
                    case "company":
                        var company = await _targetCompaniesRepository.FindByIdAsync(audience.ItemId);
                        if (company == null)
                        {
                            var entity = new campaign_TargetCompany
                            {
                                CompanyName = audience.Name,
                                MemberNumber = audience.MemberNumber,
                                ContactName = "",
                                Email = audience.Email,
                                MobileNumber = audience.MobileNumber,
                                PostalAddress = "",
                                Unsubscribed = audience.UnsubscribedAll,
                                IsActive = true
                            };

                            _targetCompaniesRepository.Create(entity);
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                            return entity.Id;
                        }
                        else
                        {
                            company.CompanyName = audience.Name;
                            company.MemberNumber = audience.MemberNumber;
                            company.Email = audience.Email;
                            company.MobileNumber = audience.MobileNumber;
                            company.Unsubscribed = audience.UnsubscribedAll;
                            _targetCompaniesRepository.Update(company);
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                            return company.Id;
                        }
                    case "person":
                        var person = await _targetPersonsRepository.FindByIdAsync(audience.ItemId);
                        if (person == null)
                        {
                            var entity = new campaign_TargetPerson
                            {
                                ContactName = audience.Name,
                                IdNumber = audience.IdNumber,
                                Email = audience.Email,
                                MobileNumber = audience.MobileNumber,
                                Unsubscribed = audience.UnsubscribedAll,
                                IsActive = true
                            };
                            _targetPersonsRepository.Create(entity);
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                            return entity.Id;
                        }
                        else
                        {
                            person.ContactName = audience.Name;
                            person.IdNumber = audience.IdNumber;
                            person.Email = audience.Email;
                            person.MobileNumber = audience.MobileNumber;
                            person.Unsubscribed = audience.UnsubscribedAll;
                            _targetPersonsRepository.Update(person);
                            await scope.SaveChangesAsync().ConfigureAwait(false);
                            return person.Id;
                        }
                }
                return audience.ItemId;
            }
        }

        public async Task EditTargetAudience(TargetAudience audience)
        {
            Contract.Requires(audience != null);
            RmaIdentity.DemandPermission(Permissions.EditTargetAudience);
            using (var scope = _dbContextScopeFactory.Create())
            {
                await AddAudienceMember(audience);
                var dataAudience = FindTargetAudience(audience.Id);
                var entity = _mapper.Map<campaign_TargetAudience>(dataAudience);
                _targetAudiencesRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task RemoveTargetAudience(int id)
        {
            RmaIdentity.DemandPermission(Permissions.RemoveTargetAudience);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var audience = await FindTargetAudience(id);
                var entity = _mapper.Map<campaign_TargetAudience>(audience);
                entity.IsActive = false;
                entity.IsDeleted = true;
                _targetAudiencesRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task ModifyTargetAudiences(int campaignId, List<TargetAudience> audiences)
        {
            RmaIdentity.DemandPermission(Permissions.EditTargetAudience);
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (audiences == null) return;
                foreach (var audience in audiences)
                {
                    if (audience.Id == 0)
                    {
                        if (audience.IsDeleted) break;

                        var targetAudience = await FindTargetAudience(audience.CampaignId, audience.ItemType, audience.ItemId);
                        if (targetAudience == null)
                        {
                            audience.CampaignId = campaignId;
                        }
                        else
                        {
                            targetAudience.Unsubscribed = audience.Unsubscribed;
                            targetAudience.IsActive = audience.IsActive;
                            targetAudience.IsDeleted = audience.IsDeleted;
                        }
                        var entity = _mapper.Map<campaign_TargetAudience>(targetAudience);
                        _targetAudiencesRepository.Update(entity);
                    }
                    else
                    {
                        var targetAudience = await FindTargetAudience(audience.Id);
                        targetAudience.CampaignId = audience.CampaignId;
                        targetAudience.ItemType = audience.ItemType;
                        targetAudience.ItemId = audience.ItemId;
                        targetAudience.Unsubscribed = audience.Unsubscribed;
                        targetAudience.IsActive = audience.IsActive;
                        targetAudience.IsDeleted = audience.IsDeleted;

                        var entity = _mapper.Map<campaign_TargetAudience>(targetAudience);
                        _targetAudiencesRepository.Update(entity);
                    }
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task CopyTargetAudience(int campaignId, int newCampaignId)
        {
            RmaIdentity.DemandPermission(Permissions.AddTargetAudience);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var audiences = await _targetAudiencesRepository
                    .Where(ta => ta.CampaignId == campaignId)
                    .ProjectTo<TargetAudience>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                foreach (var audience in audiences)
                {
                    audience.CampaignId = newCampaignId;
                    audience.Id = 0; //if you dont do this it will re-attach the previous value
                    var dataAudience = _mapper.Map<campaign_TargetAudience>(audience);
                    _targetAudiencesRepository.Create(dataAudience);

                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> AddPersonTargetAudience(int campaignId, TargetPerson targetPerson)
        {
            RmaIdentity.DemandPermission(Permissions.AddTargetAudience);
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var id = await FindTargetPersonId(targetPerson?.Email, targetPerson.MobileNumber);
                if (id == 0)
                {
                    targetPerson.Id = await AddTargetPerson(targetPerson);
                }
                else
                {
                    targetPerson.Id = id;
                    await UpdateTargetPerson(_mapper.Map<campaign_TargetPerson>(targetPerson));
                }

                await AddCampaignTarget(campaignId, "Person", targetPerson.Id);
                return targetPerson.Id;
            }
        }

        #region Private Methods
        private static void UpdateAudienceMember(ref TargetAudience audience, string name, int clientTypeId, string email, string mobile, string memberNo, string idNo, bool unsubscribe, bool unsubscribeAll)
        {
            audience.Name = name;
            audience.Email = email;
            audience.MobileNumber = mobile;
            audience.MemberNumber = memberNo;
            audience.IdNumber = idNo;
            audience.Unsubscribed = unsubscribe;
            audience.UnsubscribedAll = unsubscribeAll;
            audience.ClientTypeId = clientTypeId;
        }

        private async Task<int> AddAudienceMember(TargetAudience audience)
        {
            switch (audience.ItemType.ToLower())
            {
                case "company": return await AddTargetCompanyMember(audience);
                case "person": return await AddTargetPersonMember(audience);
                default: return audience.ItemId;
            }
        }

        private async Task<int> AddTargetCompanyMember(TargetAudience audience)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                if (audience.ItemId > 0)
                {
                    var dataMember = await _targetCompaniesRepository
                        .Where(member => member.Id == audience.ItemId)
                        .SingleOrDefaultAsync();
                    if (dataMember == null) return await InsertTargetCompanyMember(audience);

                    dataMember.CompanyName = audience.Name;
                    dataMember.MemberNumber = audience.MemberNumber;
                    dataMember.Email = audience.Email;
                    dataMember.MobileNumber = audience.MobileNumber;
                    dataMember.Unsubscribed = audience.UnsubscribedAll;
                    dataMember.ModifiedBy = audience.ModifiedBy;
                    dataMember.ModifiedDate = audience.ModifiedDate;
                    _targetCompaniesRepository.Update(dataMember);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return dataMember.Id;
                }

                return await InsertTargetCompanyMember(audience);
            }
        }

        private async Task<int> AddTargetPersonMember(TargetAudience audience)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                if (audience.ItemId > 0)
                {
                    var dataMember = await _targetPersonsRepository
                        .Where(member => member.Id == audience.ItemId)
                        .SingleOrDefaultAsync();
                    if (dataMember == null)
                    {
                        return await InsertTargetPersonMember(audience);
                    }

                    dataMember.ContactName = audience.Name;
                    dataMember.IdNumber = audience.IdNumber;
                    dataMember.Email = audience.Email;
                    dataMember.MobileNumber = audience.MobileNumber;
                    dataMember.Unsubscribed = audience.UnsubscribedAll;
                    dataMember.ModifiedBy = audience.ModifiedBy;
                    dataMember.ModifiedDate = audience.ModifiedDate;
                    _targetPersonsRepository.Update(dataMember);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return dataMember.Id;
                }

                return await InsertTargetPersonMember(audience);
            }
        }

        private async Task<int> InsertTargetPersonMember(TargetAudience audience)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var person = new TargetPerson
                {
                    Id = 0,
                    ContactName = audience.Name,
                    IdNumber = audience.IdNumber,
                    Email = audience.Email,
                    MobileNumber = audience.MobileNumber,
                    Unsubscribed = audience.UnsubscribedAll,
                    IsActive = audience.IsActive,
                    IsDeleted = audience.IsDeleted,
                    CreatedBy = audience.CreatedBy,
                    CreatedDate = audience.CreatedDate,
                    ModifiedBy = audience.ModifiedBy,
                    ModifiedDate = audience.ModifiedDate
                };
                var entity = _mapper.Map<campaign_TargetPerson>(person);
                _targetPersonsRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        private async Task<int> InsertTargetCompanyMember(TargetAudience audience)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var company = new TargetCompany
                {
                    Id = 0,
                    CompanyName = audience.Name,
                    MemberNumber = audience.MemberNumber,
                    ContactName = "",
                    Email = audience.Email,
                    MobileNumber = audience.MobileNumber,
                    PostalAddress = "",
                    Unsubscribed = audience.UnsubscribedAll,
                    IsActive = audience.IsActive,
                    IsDeleted = audience.IsDeleted,
                    CreatedBy = audience.CreatedBy,
                    CreatedDate = audience.CreatedDate,
                    ModifiedBy = audience.ModifiedBy,
                    ModifiedDate = audience.ModifiedDate
                };
                var entity = _mapper.Map<campaign_TargetCompany>(company);
                _targetCompaniesRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        private async Task<TargetAudience> FindTargetAudience(int campaignId, string itemType, int itemId)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var audience = await _targetAudiencesRepository
                    .Where(ta => ta.CampaignId == campaignId
                                 && ta.ItemType.Equals(itemType, StringComparison.OrdinalIgnoreCase)
                                 && ta.ItemId == itemId)
                    .ProjectTo<TargetAudience>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync();
                return audience;
            }
        }

        private async Task<TargetAudience> FindTargetAudience(int id)
        {
            var audience = await _targetAudiencesRepository
                .Where(ta => ta.Id == id)
                .ProjectTo<TargetAudience>(_mapper.ConfigurationProvider)
                .SingleAsync($"TargetAudience with id {id} could not be found.");

            return audience;
        }

        private async Task<int> FindTargetCompanyId(string email)
        {
            var target = await _targetCompaniesRepository
                .Where(ta => ta.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
                .SingleOrDefaultAsync();
            if (target == null) return 0;

            return target.Id;
        }

        private async Task<int> AddTargetCompany(TargetCompany target)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var dataTarget = _mapper.Map<campaign_TargetCompany>(target);
                _targetCompaniesRepository.Create(dataTarget);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return dataTarget.Id;
            }
        }

        private async Task UpdateTargetCompany(campaign_TargetCompany target)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                _targetCompaniesRepository.Update(target);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task AddCampaignTarget(int campaignId, string itemType, int itemId)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var audience = await _targetAudiencesRepository
                    .Where(ta => ta.CampaignId == campaignId
                                 && ta.ItemId == itemId
                                 && ta.ItemType == itemType)
                    .ProjectTo<TargetAudience>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync();
                if (audience == null)
                {
                    audience = CreateNewTargetAudience(campaignId, itemType, itemId);
                    var entity = _mapper.Map<campaign_TargetAudience>(audience);
                    _targetAudiencesRepository.Create(entity);
                }
                else
                {
                    audience.IsActive = true;
                    audience.IsDeleted = false;
                    var entity = _mapper.Map<campaign_TargetAudience>(audience);
                    _targetAudiencesRepository.Update(entity);
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private TargetAudience CreateNewTargetAudience(int campaignId, string itemType, int itemId)
        {
            var targetAudience = new TargetAudience
            {
                Id = 0,
                CampaignId = campaignId,
                ItemId = itemId,
                ItemType = itemType,
                Unsubscribed = false,
                IsActive = true
            };
            return targetAudience;
        }

        private async Task<int> FindTargetPersonId(string emailAddress, string mobileNumber)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var email = string.IsNullOrEmpty(emailAddress) ? "XxxYYYzzZz" : emailAddress.Trim();
                var phone = string.IsNullOrEmpty(mobileNumber) ? "XxxYYYzzZz" : mobileNumber.Trim();
                var target = await _targetPersonsRepository
                    .Where(ta =>
                        ta.Email.Equals(email, StringComparison.OrdinalIgnoreCase) || ta.MobileNumber.Equals(phone))
                    .ProjectTo<TargetPerson>(_mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync();

                return target?.Id ?? 0;
            }
        }

        private async Task<int> AddTargetPerson(TargetPerson target)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var dataTarget = _mapper.Map<campaign_TargetPerson>(target);
                _targetPersonsRepository.Create(dataTarget);

                await scope.SaveChangesAsync().ConfigureAwait(false);
                return dataTarget.Id;
            }
        }

        private async Task<int> UpdateTargetPerson(campaign_TargetPerson target)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                _targetPersonsRepository.Update(target);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return target.Id;
            }
        }

        private async Task<int> ImportAudiences(ImportRequest request, ImportFile importFile,
            CancellationToken cancellationToken)
        {
            try
            {
                var audienceType = TargetAudienceType.Unspecified;
                var data = await GetFileData(importFile, cancellationToken);

                if (data.Columns.Contains(GetDescription(CompanyColumns.CompanyName)))
                    audienceType = TargetAudienceType.Company;
                else if (data.Columns.Contains(GetDescription(PersonColumns.IdNumber)))
                    audienceType = TargetAudienceType.Person;
                if (audienceType == TargetAudienceType.Unspecified) throw new BusinessException("Invalid import file type.");
                await ImportAudience(importFile, request.CampaignId, audienceType, data, cancellationToken);
                UpdateStatus(importFile, ImportStatus.Completed);

                await _importFileService.EditImportFile(importFile);

                return importFile.ProcessedCount;
            }
            catch (Exception e)
            {
                UpdateStatus(importFile, ImportStatus.Error, e.Message);
                return 0;
            }
        }

        private static void UpdateStatus(ImportFile importFile, ImportStatus status, string message = null)
        {
            importFile.Status = status.ToString();
            if (!string.IsNullOrEmpty(message)) importFile.LastError += $"{{Row:0, Message\"{message}\"}},";
            importFile.LastError = message ?? importFile.LastError;
        }

        private async Task<DataTable> GetFileData(ImportFile importFile, CancellationToken cancellationToken)
        {
            using (DataTable data = new DataTable())
            {
                var upload = await _uploadService.GetUploadByToken(importFile.FileToken);
                using (MemoryStream stream = new MemoryStream(upload.Data))
                {
                    stream.Seek(0, SeekOrigin.Begin);
                    using (var parser = new TextFieldParser(stream))
                    {
                        var columnsAdded = false;
                        parser.TrimWhiteSpace = true;
                        parser.SetDelimiters(",");
                        while (!parser.EndOfData)
                        {
                            if (cancellationToken.IsCancellationRequested)
                            {
                                UpdateStatus(importFile, ImportStatus.Interrupted);
                                return data;
                            }
                            var fields = parser.ReadFields();
                            if (fields != null)
                            {
                                if (!columnsAdded)
                                {
                                    foreach (var field in fields) data.Columns.Add(new DataColumn(field));
                                    columnsAdded = true;
                                }
                                else
                                {
                                    data.Rows.Add(fields.ToArray<object>());
                                }
                            }
                        }
                    }
                    importFile.RecordCount = data.Rows.Count;
                    return data;
                }
            }
        }

        private DataTable GetFileData(ImportFile importFile, Uri uri, CancellationToken cancellationToken)
        {
            using (DataTable data = new DataTable())
            {
                using (var client = new WebClient())
                {
                    var stream = client.OpenRead(uri);
                    if (stream == null) throw new BusinessException($"Could not open {uri} for read.");
                    using (var parser = new TextFieldParser(stream))
                    {
                        var columnsAdded = false;
                        parser.TrimWhiteSpace = true;
                        parser.SetDelimiters(",");
                        while (!parser.EndOfData)
                        {
                            if (cancellationToken.IsCancellationRequested)
                            {
                                UpdateStatus(importFile, ImportStatus.Interrupted);
                                return data;
                            }

                            var fields = parser.ReadFields();
                            if (fields != null)
                            {
                                if (!columnsAdded)
                                {
                                    foreach (var field in fields) data.Columns.Add(new DataColumn(field));
                                    columnsAdded = true;
                                }
                                else
                                {
                                    data.Rows.Add(fields.ToArray<object>());
                                }
                            }
                        }
                    }
                }

                importFile.RecordCount = data.Rows.Count;
                return data;
            }
        }

        private static string GetDescription(Enum value)
        {
            return value.GetType().GetMember(value.ToString()).FirstOrDefault()
                ?.GetCustomAttribute<DescriptionAttribute>()
                ?.Description;
        }

        private async Task ImportAudience(ImportFile importFile, int campaignId, TargetAudienceType audienceType, DataTable data,
            CancellationToken cancellationToken)
        {
            switch (audienceType)
            {
                case TargetAudienceType.Company:
                    ValidateColumns(data, GetDescriptions(typeof(CompanyColumns)));
                    await ImportCompanyAudience(importFile, campaignId, data, cancellationToken);
                    break;
                case TargetAudienceType.Person:
                    ValidateColumns(data, GetDescriptions(typeof(PersonColumns)));
                    await ImportPersonAudience(importFile, campaignId, data, cancellationToken);
                    break;
            }
        }

        private async Task ImportCompanyAudience(ImportFile importFile, int campaignId, DataTable data, CancellationToken cancellationToken)
        {
            importFile.LastError = "";
            var list = LoadTargetCompanies(importFile, data, cancellationToken);
            if (list == null) return;
            importFile.ProcessedCount = await SaveCompanyAudience(importFile, campaignId, list, cancellationToken);
        }

        private async Task<int> SaveCompanyAudience(ImportFile importFile, int campaignId, List<TargetCompany> list,
            CancellationToken cancellationToken)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var count = 0;
                foreach (var target in list)
                {
                    if (cancellationToken.IsCancellationRequested)
                    {
                        UpdateStatus(importFile, ImportStatus.Cancelled);
                        return count;
                    }

                    await AddCompanyTarget(campaignId, target);
                    count++;
                }

                return count;
            }
        }

        private async Task<int> AddCompanyTarget(int campaignId, TargetCompany targetCompany)
        {
            var id = await FindTargetCompany(targetCompany.Email);
            if (id == 0)
            {
                targetCompany.Id = await AddTargetCompany(targetCompany);
            }
            else
            {
                targetCompany.Id = id;
                await UpdateTargetCompany(_mapper.Map<campaign_TargetCompany>(targetCompany));
            }

            await AddCampaignTarget(campaignId, "Company", targetCompany.Id);
            return targetCompany.Id;
        }

        private async Task<int> FindTargetCompany(string email)
        {
            using (_dbContextScopeFactory.Create())
            {
                var target = await _targetCompaniesRepository
                    .Where(ta => ta.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
                    .SingleOrDefaultAsync();
                if (target == null) return 0;
                return target.Id;
            }
        }

        private async Task ImportPersonAudience(ImportFile importFile, int campaignId, DataTable data, CancellationToken cancellationToken)
        {
            importFile.LastError = "";
            var list = LoadTargetPersons(importFile, data, cancellationToken);
            if (list == null) return;
            importFile.ProcessedCount = await SavePersonAudience(importFile, campaignId, list, cancellationToken);
        }

        private async Task<int> SavePersonAudience(ImportFile importFile, int campaignId, List<TargetPerson> list,
            CancellationToken cancellationToken)
        {
            var count = 0;
            foreach (var target in list)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    UpdateStatus(importFile, ImportStatus.Cancelled);
                    return count;
                }

                await AddPersonTargetAudience(campaignId, target);
                count++;
            }

            return count;
        }

        private List<TargetPerson> LoadTargetPersons(ImportFile importFile, DataTable data, CancellationToken cancellationToken)
        {
            var rowNumber = 1;
            var list = new List<TargetPerson>();
            foreach (DataRow row in data.Rows)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    UpdateStatus(importFile, ImportStatus.Interrupted);
                    return null;
                }

                var person = GetTargetPerson(importFile, row, rowNumber++);
                if (person != null) list.Add(person);
            }

            return list;
        }

        private TargetPerson GetTargetPerson(ImportFile importFile, DataRow row, int rowNumber)
        {
            try
            {
                var person = new TargetPerson
                {
                    Id = 0,
                    ContactName = (string)row[GetDescription(PersonColumns.ContactName)],
                    IdNumber = (string)row[GetDescription(PersonColumns.IdNumber)],
                    Email = (string)row[GetDescription(PersonColumns.Email)],
                    MobileNumber = (string)row[GetDescription(PersonColumns.MobileNumber)],
                    Unsubscribed = false,
                    IsActive = true
                };
                ValidatePerson(person);
                return person;
            }
            catch (Exception ex)
            {
                ex.LogException();
                importFile.LastError += $"{{Row:{rowNumber}, Message: \"{ex.Message}\"}},";
                return null;
            }
        }

        private static void ValidatePerson(TargetPerson person)
        {
            if (string.IsNullOrEmpty(person.ContactName)) throw new BusinessException("Contact name cannot be blank.");
            if (string.IsNullOrEmpty(person.Email)) throw new BusinessException("Email address cannot be blank.");
            if (!person.Email.IsValidEmail()) throw new BusinessException($"'{person.Email}' is not a valid email address.");
        }

        private void ValidateColumns(DataTable data, string[] columns)
        {
            foreach (var column in columns)
            {
                if (!data.Columns.Contains(column))
                    throw new BusinessException($"Column '{column}' does not belong to table.");
            }
        }

        private static string[] GetDescriptions(Type type)
        {
            var list = new List<string>();
            foreach (Enum value in Enum.GetValues(type)) list.Add(GetDescription(value));
            return list.ToArray();
        }

        private List<TargetCompany> LoadTargetCompanies(ImportFile importFile, DataTable data, CancellationToken cancellationToken)
        {
            var rowNumber = 1;
            var list = new List<TargetCompany>();
            foreach (DataRow row in data.Rows)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    UpdateStatus(importFile, ImportStatus.Interrupted);
                    return null;
                }

                var company = GetTargetCompany(importFile, row, rowNumber++);
                if (company != null) list.Add(company);
            }

            return list;
        }

        private TargetCompany GetTargetCompany(ImportFile importFile, DataRow row, int rowNumber)
        {
            try
            {
                var company = new TargetCompany
                {
                    Id = 0,
                    CompanyName = (string)row[GetDescription(CompanyColumns.CompanyName)],
                    MemberNumber = (string)row[GetDescription(CompanyColumns.MemberNumber)],
                    ContactName = (string)row[GetDescription(CompanyColumns.ContactName)],
                    Email = (string)row[GetDescription(CompanyColumns.Email)],
                    MobileNumber = (string)row[GetDescription(CompanyColumns.MobileNumber)],
                    PostalAddress = (string)row[GetDescription(CompanyColumns.PostalAddress)],
                    Unsubscribed = false,
                    IsActive = true
                };
                ValidateCompany(company);
                return company;
            }
            catch (Exception ex)
            {
                ex.LogException();
                importFile.LastError += $"{{Row:{rowNumber}, Message: \"{ex.Message}\"}},";
                return null;
            }
        }

        private static void ValidateCompany(TargetCompany company)
        {
            if (string.IsNullOrEmpty(company.CompanyName)) throw new BusinessException("Company name cannot be blank.");
            if (string.IsNullOrEmpty(company.Email)) throw new BusinessException("Email address cannot be blank.");
            if (!company.Email.IsValidEmail()) throw new BusinessException($"'{company.Email}' is not a valid email address.");
        }

        private enum CompanyColumns
        {
            [Description("Company Name")] CompanyName,
            [Description("Member Number")] MemberNumber,
            [Description("Contact Name")] ContactName,
            [Description("Email")] Email,
            [Description("Mobile Number")] MobileNumber,
            [Description("Postal Address")] PostalAddress
        }

        private enum PersonColumns
        {
            [Description("ID Number")] IdNumber,
            [Description("Contact Name")] ContactName,
            [Description("Email")] Email,
            [Description("Mobile Number")] MobileNumber
        }

        private enum ImportStatus
        {
            Processing,
            Interrupted,
            Completed,
            Error,
            Cancelled
        }

        private enum TargetAudienceType
        {
            Unspecified,
            Client,
            Company,
            Person,
            Lead,
            ClientType,
            Group,
            Industry,
            IndustryClass,
            LeadClientType,
            LeadIndustryClass,
            WithProduct,
            WithoutProduct
        }
    }
    #endregion
}