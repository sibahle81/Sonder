
using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimRequirementFacade : RemotingStatelessService, IClaimRequirementService
    {

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_ClaimRequirementCategory> _claimRequirementCategoriesRepository;
        private readonly IRepository<claim_ClaimRequirementCategoryMapping> _claimRequirementCategoriesMappingRepository;
        private readonly IRepository<claim_PersonEventClaimRequirement> _personEventClaimRequirementRepository;
        private readonly IMedicalFormService _medicalFormService;
        private readonly ISerializerService _serializer;
        private readonly IWizardService _wizardService;
        private readonly IClaimCommunicationService _claimCommunicationService;
        private readonly IUserService _userService;

        public ClaimRequirementFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_ClaimRequirementCategory> claimRequirementCategoriesRepository
            , IRepository<claim_ClaimRequirementCategoryMapping> claimRequirementCategoriesMappingRepository
            , IRepository<claim_PersonEventClaimRequirement> personEventClaimRequirementRepository
            , ISerializerService serializer
            , IMedicalFormService medicalFormService
            , IWizardService wizardService
            , IClaimCommunicationService claimCommunicationService
            , IUserService userService
            ) :
            base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _claimRequirementCategoriesRepository = claimRequirementCategoriesRepository;
            _claimRequirementCategoriesMappingRepository = claimRequirementCategoriesMappingRepository;
            _personEventClaimRequirementRepository = personEventClaimRequirementRepository;
            _medicalFormService = medicalFormService;
            _serializer = serializer;
            _wizardService = wizardService;
            _claimCommunicationService = claimCommunicationService;
            _userService = userService;
        }

        public async Task<List<PersonEventClaimRequirement>> GetPersonEventRequirements(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var isInternalUser = RmaIdentity.UserId > 0 ? (await _userService.GetUserById(RmaIdentity.UserId)).IsInternalUser : true;
                var entities = new List<claim_PersonEventClaimRequirement>();

                if (isInternalUser)
                {
                    entities = await _personEventClaimRequirementRepository.Where(a => a.PersonEventId == personEventId).ToListAsync();
                }
                else
                {
                    entities = await _personEventClaimRequirementRepository.Where(a => a.PersonEventId == personEventId && a.IsMemberVisible == true).ToListAsync();
                }

                await _personEventClaimRequirementRepository.LoadAsync(entities, e => e.ClaimRequirementCategory);

                return Mapper.Map<List<PersonEventClaimRequirement>>(entities);
            }
        }

        public async Task<PersonEventClaimRequirement> GetEventRequirementByClaimRequirementCategoryId(int claimRequirementClaimCategoryId, int personEvent)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _personEventClaimRequirementRepository.FirstOrDefaultAsync(a => a.ClaimRequirementCategoryId == claimRequirementClaimCategoryId && a.PersonEventId == personEvent);
                if (entity != null)
                {
                    await _personEventClaimRequirementRepository.LoadAsync(entity, e => e.ClaimRequirementCategory);
                    return Mapper.Map<PersonEventClaimRequirement>(entity);
                }
                else
                    return null;

            }
        }

        public async Task<int> UpdatePersonEventClaimRequirement(PersonEventClaimRequirement personEventClaimRequirement)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_PersonEventClaimRequirement>(personEventClaimRequirement);

                _personEventClaimRequirementRepository.Update(entity);
                await scope.SaveChangesAsync();

                return entity.PersonEventClaimRequirementId;
            }
        }

        public async Task<int> UpdatePersonEventClaimRequirements(List<PersonEventClaimRequirement> personEventClaimRequirements)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = Mapper.Map<List<claim_PersonEventClaimRequirement>>(personEventClaimRequirements);

                _personEventClaimRequirementRepository.Update(entities);
                return await scope.SaveChangesAsync();
            }
        }

        public async Task<int> AddPersonEventClaimRequirement(PersonEventClaimRequirement personEventClaimRequirement)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_PersonEventClaimRequirement>(personEventClaimRequirement);
                _personEventClaimRequirementRepository.Create(entity);
                await scope.SaveChangesAsync();
                return entity.PersonEventClaimRequirementId;
            }
        }

        public async Task<int> AddPersonEventClaimRequirements(List<PersonEventClaimRequirement> personEventClaimRequirements)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<List<claim_PersonEventClaimRequirement>>(personEventClaimRequirements);
                _personEventClaimRequirementRepository.Create(entity);
                return await scope.SaveChangesAsync();
            }
        }

        public async Task<List<ClaimRequirementCategoryMapping>> GeneratePersonEventRequirements(ClaimRequirementMapping claimRequirementMapping)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = await _claimRequirementCategoriesMappingRepository.Where(a => a.EventType == claimRequirementMapping.EventType
                                                                                    && a.IsFatal == claimRequirementMapping.isFatal
                                                                                    && (a.IsMva == claimRequirementMapping.isRoadAccident
                                                                                    || a.IsAssault == claimRequirementMapping.isAssault
                                                                                    || a.IsTrainee == claimRequirementMapping.isTrainee)).ToListAsync();
                await _claimRequirementCategoriesMappingRepository.LoadAsync(entities, e => e.ClaimRequirementCategory);
                return entities.Count() != 0 ? Mapper.Map<List<ClaimRequirementCategoryMapping>>(entities) : null;
            }
        }

        public async Task<List<ClaimRequirementCategory>> GetClaimRequirementCategory()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimRequirement = await _claimRequirementCategoriesRepository.OrderBy(u => u.Name).ToListAsync();

                return Mapper.Map<List<ClaimRequirementCategory>>(claimRequirement);
            }
        }

        public async Task<List<ClaimRequirementCategory>> GetClaimRequirementCategoryLinkedToPersonEvent(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEventRequirements = await GetPersonEventRequirements(personEventId);
                var claimRequirements = new List<claim_ClaimRequirementCategory>();
                foreach (var personEventRequirement in personEventRequirements)
                {
                    var claimRequirement = await _claimRequirementCategoriesRepository.FirstOrDefaultAsync(c => c.ClaimRequirementCategoryId == personEventRequirement.ClaimRequirementCategoryId);
                    claimRequirements.Add(claimRequirement);
                }


                return Mapper.Map<List<ClaimRequirementCategory>>(claimRequirements);
            }
        }

        public async Task<ClaimRequirementCategory> GetClaimRequirementCategoryById(DocumentTypeEnum documenTypeId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimRequirement = await _claimRequirementCategoriesRepository.FirstOrDefaultAsync(c => c.DocumentType == documenTypeId);

                return Mapper.Map<ClaimRequirementCategory>(claimRequirement);
            }
        }

        public async Task<int> AddClaimRequirement(PersonEventClaimRequirement requirement)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var data = await _personEventClaimRequirementRepository
                .Where(r => r.PersonEventId == requirement.PersonEventId && r.ClaimRequirementCategoryId == requirement.ClaimRequirementCategoryId).FirstOrDefaultAsync();
                if (data == null)
                {
                    var entity = new claim_PersonEventClaimRequirement
                    {
                        PersonEventId = requirement.PersonEventId,
                        ClaimRequirementCategoryId = requirement.ClaimRequirementCategoryId,
                        Instruction = requirement.Instruction,
                        CreatedBy = RmaIdentity.Email,
                        CreatedDate = DateTime.Now,
                        DateOpened = DateTime.Now,
                        ModifiedBy = RmaIdentity.Email,
                        ModifiedDate = DateTime.Now
                    };
                    _personEventClaimRequirementRepository.Create(entity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                }
                return requirement.ClaimRequirementCategoryId;

            }
        }

        public async Task<List<ClaimRequirementCategory>> UpdateClaimRequirements(PersonEvent personEvent)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var firstMedicalReport = await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEvent.PersonEventId);
                var progressMedicalReport = await _medicalFormService.GetProgressMedicalReportByPersonEventId(personEvent.PersonEventId);
                var finalMedicalReport = await _medicalFormService.GetFinalMedicalReportByPersonEventId(personEvent.PersonEventId);

                if (firstMedicalReport.MedicalReportForm.DocumentStatusId == Admin.MasterDataManager.Contracts.Enums.DocumentStatusEnum.Accepted)
                {

                }
                var claimRequirement = await _claimRequirementCategoriesRepository.OrderBy(u => u.Name).ToListAsync();

                return Mapper.Map<List<ClaimRequirementCategory>>(claimRequirement);
            }
        }

        public async Task<PersonEventClaimRequirement> GetPersonEventRequirementByCategoryId(int personEventId, int categoryId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _personEventClaimRequirementRepository
                    .FirstOrDefaultAsync(a => a.PersonEventId == personEventId && a.ClaimRequirementCategoryId == categoryId);

                if (entities != null)
                {
                    await _personEventClaimRequirementRepository.LoadAsync(entities, e => e.ClaimRequirementCategory);
                    return Mapper.Map<PersonEventClaimRequirement>(entities);
                }
                return null;
            }
        }

        public async Task<PersonEventClaimRequirement> GetRequirementByDocumentTypeId(int personEventId, DocumentTypeEnum documentType)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEventEntities = new PersonEventClaimRequirement();
                var entityList = await _claimRequirementCategoriesRepository.Where(a => a.DocumentType == documentType).ToListAsync();
                var entity = new claim_ClaimRequirementCategory();
                if (entityList != null)
                {
                    var personEventClaimRequirements = await _personEventClaimRequirementRepository.Where(x => x.PersonEventId.Equals(personEventId)).ToListAsync();

                    foreach (var item in entityList)
                    {
                        foreach (var subItem in personEventClaimRequirements)
                        {
                            if (item.ClaimRequirementCategoryId == subItem.ClaimRequirementCategoryId)
                            {
                                entity = item;
                                {
                                    personEventEntities = await GetPersonEventRequirementByCategoryId(personEventId, entity.ClaimRequirementCategoryId);
                                    break;
                                }
                            }
                        }
                    }
                }
                return Mapper.Map<PersonEventClaimRequirement>(personEventEntities);
            }
        }

        public async Task StartSection40Workflow(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            if (!personEvent.IsStraightThroughProcess)
            {
                var request = new StartWizardRequest
                {
                    AllowMultipleWizards = false,
                    LinkedItemId = personEvent.PersonEventId,
                    Type = "Section-40-notification",
                    Data = _serializer.Serialize(personEvent)
                };
                await _wizardService.StartWizard(request);
            }
        }

        public async Task<List<PersonEventClaimRequirement>> GetConfiguredRequirements(PersonEvent personEvent)
        {
            Contract.Requires(personEvent != null);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var query = _claimRequirementCategoriesMappingRepository.AsQueryable();
                query = query.Where(r => !r.ClaimRequirementCategory.IsManuallyAdded);
                var isMVA = false;

                if (personEvent.PersonEventDiseaseDetail != null) // Disease Event
                {
                    int? diseaseType = (int?)(personEvent.PersonEventDiseaseDetail?.TypeOfDisease);
                    var isFatal = personEvent.IsFatal ?? false;
                    query = query.Where(r => r.EventType == EventTypeEnum.Disease && r.IsFatal == isFatal && r.DiseaseTypeId == diseaseType && !r.IsDeleted);
                }
                else if (personEvent.PhysicalDamages?.Count > 0) // Accident Event
                {
                    var isAssault = personEvent.IsAssault;
                    var isFatal = personEvent.IsFatal ?? false;
                    isMVA = personEvent.PersonEventAccidentDetail?.IsRoadAccident == true;

                    query = query.Where(r => r.EventType == EventTypeEnum.Accident && r.IsAssault == isAssault && r.IsFatal == isFatal && r.IsMva == isMVA && !r.IsDeleted);
                }

                var requirementCategoryMappings = await query.ToListAsync();
                await _claimRequirementCategoriesMappingRepository.LoadAsync(requirementCategoryMappings, r => r.ClaimRequirementCategory);

                if (isMVA && personEvent.PersonEventAccidentDetail?.IsOccurPerformingScopeofDuty == true)
                {
                    requirementCategoryMappings.RemoveAll(s => s.ClaimRequirementCategory.DocumentSet == DocumentSetEnum.CJP);
                }

                var personEventClaimRequirements = new List<PersonEventClaimRequirement>();

                foreach (var requirementCategoryMapping in requirementCategoryMappings)
                {
                    var personEventClaimRequirement = new PersonEventClaimRequirement
                    {
                        ClaimRequirementCategoryId = requirementCategoryMapping.ClaimRequirementCategory.ClaimRequirementCategoryId,
                        Instruction = requirementCategoryMapping.ClaimRequirementCategory.Description,
                        DateOpened = DateTimeHelper.SaNow,
                        ClaimRequirementCategory = Mapper.Map<ClaimRequirementCategory>(requirementCategoryMapping.ClaimRequirementCategory),
                        IsMinimumRequirement = requirementCategoryMapping.IsMinimumRequirement,
                        IsMemberVisible = requirementCategoryMapping.ClaimRequirementCategory.IsMemberVisible
                    };

                    //handle non citizen
                    if (personEvent.RolePlayer?.Person?.IdType != IdTypeEnum.PassportDocument && (string.Equals(personEventClaimRequirement.Instruction.Trim(), "Passport Document Outstanding", StringComparison.OrdinalIgnoreCase) || string.Equals(personEventClaimRequirement.Instruction.Trim(), "Children’s Fingerprint Report", StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    personEventClaimRequirements.Add(personEventClaimRequirement);
                }

                return personEventClaimRequirements;
            }
        }

        public async Task<PagedRequestResult<ClaimRequirementCategory>> GetPagedClaimRequirementCategory(ClaimRequirementCategorySearchRequest claimRequirementCategorySearchRequest)
        {
            Contract.Requires(claimRequirementCategorySearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var query = _claimRequirementCategoriesRepository.AsQueryable();
                query = query.Where(r => r.IsManuallyAdded);

                if (claimRequirementCategorySearchRequest.EventType.HasValue)
                {
                    var eventType = claimRequirementCategorySearchRequest.EventType.Value;
                    query = query.Where(r => r.ClaimRequirementCategoryMappings.Any(t => t.EventType == eventType));
                }

                if (!string.IsNullOrEmpty(claimRequirementCategorySearchRequest.PagedRequest.SearchCriteria))
                {
                    var filter = claimRequirementCategorySearchRequest.PagedRequest.SearchCriteria;
                    query = query.Where(r => r.Name.Contains(filter));
                }

                query = query.Where(r => !r.IsDeleted);

                var claimRequirementCategories = await query.ToPagedResult(claimRequirementCategorySearchRequest.PagedRequest);

                var data = Mapper.Map<List<ClaimRequirementCategory>>(claimRequirementCategories.Data);

                return new PagedRequestResult<ClaimRequirementCategory>
                {
                    Page = claimRequirementCategorySearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(claimRequirementCategories.RowCount / (double)claimRequirementCategorySearchRequest.PagedRequest.PageSize),
                    RowCount = claimRequirementCategories.RowCount,
                    PageSize = claimRequirementCategorySearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }

        public async Task<bool> SendAdhocClaimRequirementCommunication(AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _claimCommunicationService.SendAdhocClaimRequirementCommunicationEmail(adhocClaimRequirementCommunicationRequest);
                return true;
            }
        }

        public async Task<bool> SendAdhocClaimRequirementCommunicationSms(AdhocClaimRequirementCommunicationRequest adhocClaimRequirementCommunicationRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _claimCommunicationService.SendAdhocClaimRequirementCommunicationSms(adhocClaimRequirementCommunicationRequest);
                return true;
            }
        }
    }
}


