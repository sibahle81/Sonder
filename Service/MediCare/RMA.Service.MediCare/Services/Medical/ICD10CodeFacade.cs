using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;
using RMA.Service.MediCare.Utils;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using DatabaseConstants = RMA.Service.MediCare.Database.Constants.DatabaseConstants;

namespace RMA.Service.MediCare.Services.Medical
{
    public class ICD10CodeFacade : RemotingStatelessService, IICD10CodeService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_Icd10Code> _icd10CodeRepository;
        private readonly IRepository<medical_Icd10GroupMap> _icd10GroupMapRepository;
        private readonly IRepository<medical_Icd10SubCategory> _icd10SubCategoryRepository;
        private readonly IRepository<medical_Icd10DiagnosticGroup> _icd10DiagnosticGroupRepository;
        private readonly IRepository<medical_Icd10Category> _icd10CategoryRepository;
        private readonly IRepository<medical_PractitionerTypeRCodeMapping> _practitionerTypeRCodeMappingRepository;
        private readonly IRepository<medical_PractitionerTypeIcd10ValidationExclusion> _practitionerTypeIcd10ValidationExclusionRepository;

        public ICD10CodeFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_Icd10Code> icd10CodeRepository
            , IRepository<medical_Icd10SubCategory> icd10SubCategoryRepository
            , IRepository<medical_Icd10DiagnosticGroup> icd10DiagnosticGroupRepository
            , IRepository<medical_Icd10GroupMap> icd10GroupMapRepository
            , IRepository<medical_Icd10Category> icd10CategoryRepository
            , IRepository<medical_PractitionerTypeRCodeMapping> practitionerTypeRCodeMappingRepository
            , IRepository<medical_PractitionerTypeIcd10ValidationExclusion> practitionerTypeIcd10ValidationExclusionRepository
            )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _icd10CodeRepository = icd10CodeRepository;
            _icd10SubCategoryRepository = icd10SubCategoryRepository;
            _icd10DiagnosticGroupRepository = icd10DiagnosticGroupRepository;
            _icd10GroupMapRepository = icd10GroupMapRepository;
            _icd10CategoryRepository = icd10CategoryRepository;
            _practitionerTypeRCodeMappingRepository = practitionerTypeRCodeMappingRepository;
            _practitionerTypeIcd10ValidationExclusionRepository = practitionerTypeIcd10ValidationExclusionRepository;
        }

        public async Task<ICD10Code> GetICD10CodeById(int icd10CodeId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _icd10CodeRepository.Where(x => x.Icd10CodeId == icd10CodeId).FirstOrDefaultAsync();
                await _icd10CodeRepository.LoadAsync(entity, x => x.Icd10SubCategory);
                return Mapper.Map<ICD10Code>(entity);
            }
        }

        public async Task<ICD10DiagnosticGroup> GetICD10DiagnosticGroup(int icd10DiagnosticGroupId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _icd10DiagnosticGroupRepository.FirstOrDefaultAsync(x => x.Icd10DiagnosticGroupId == icd10DiagnosticGroupId);
                return Mapper.Map<ICD10DiagnosticGroup>(entity);
            }
        }

        public async Task<List<ICD10Code>> GetICD10CodesByEventTypeDRGAndSubCategory(ICD10CodeModel icd10CodeModel)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                               from map in _icd10GroupMapRepository
                               join drg in _icd10DiagnosticGroupRepository on map.Icd10DiagnosticGroupId equals drg.Icd10DiagnosticGroupId
                               join icd in _icd10CodeRepository on map.Icd10CodeId equals icd.Icd10CodeId
                               join sub in _icd10SubCategoryRepository on icd.Icd10SubCategoryId equals sub.Icd10SubCategoryId
                               join cat in _icd10CategoryRepository on sub.Icd10CategoryId equals cat.Icd10CategoryId
                               where map.EventType == icd10CodeModel.EventType && drg.Icd10DiagnosticGroupId == icd10CodeModel.Icd10DiagnosticGroupId
                                && icd.Icd10SubCategoryId == icd10CodeModel.Icd10SubCategoryId
                                && map.IsActive && drg.IsActive && icd.IsActive && sub.IsActive && cat.IsActive
                               select new ICD10Code
                               {
                                   Icd10CodeId = icd.Icd10CodeId,
                                   Icd10Code = icd.Icd10Code,
                                   Icd10CodeDescription = icd.Icd10CodeDescription,
                                   Icd10SubCategoryId = icd.Icd10SubCategoryId,
                                   IsActive = icd.IsActive,
                                   CreatedBy = icd.CreatedBy,
                                   CreatedDate = icd.CreatedDate,
                                   ModifiedBy = icd.ModifiedBy,
                                   ModifiedDate = icd.ModifiedDate
                               }).Distinct().ToListAsync();
            }
        }

        public async Task<List<ICD10SubCategory>> GetICD10SubCategoriesByEventTypeDRGAndCategory(ICD10CodeModel icd10CodeModel)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                               from map in _icd10GroupMapRepository
                               join drg in _icd10DiagnosticGroupRepository on map.Icd10DiagnosticGroupId equals drg.Icd10DiagnosticGroupId
                               join icd in _icd10CodeRepository on map.Icd10CodeId equals icd.Icd10CodeId
                               join sub in _icd10SubCategoryRepository on icd.Icd10SubCategoryId equals sub.Icd10SubCategoryId
                               join cat in _icd10CategoryRepository on sub.Icd10CategoryId equals cat.Icd10CategoryId
                               where map.EventType == icd10CodeModel.EventType && drg.Icd10DiagnosticGroupId == icd10CodeModel.Icd10DiagnosticGroupId
                                && sub.Icd10CategoryId == icd10CodeModel.Icd10CategoryId
                                && map.IsActive && drg.IsActive && icd.IsActive && sub.IsActive && cat.IsActive
                               select new ICD10SubCategory
                               {
                                   Icd10SubCategoryId = sub.Icd10SubCategoryId,
                                   Icd10CategoryId = sub.Icd10CategoryId,
                                   Icd10SubCategoryCode = sub.Icd10SubCategoryCode,
                                   Icd10SubCategoryDescription = sub.Icd10SubCategoryDescription,
                                   IsActive = sub.IsActive,
                                   CreatedBy = sub.CreatedBy,
                                   CreatedDate = sub.CreatedDate,
                                   ModifiedBy = sub.ModifiedBy,
                                   ModifiedDate = sub.ModifiedDate
                               }).Distinct().ToListAsync();
            }
        }

        public async Task<List<ICD10Category>> GetICD10CategoriesByEventTypeAndDiagnosticGroup(ICD10CodeModel icd10CodeModel)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                               from map in _icd10GroupMapRepository
                               join drg in _icd10DiagnosticGroupRepository on map.Icd10DiagnosticGroupId equals drg.Icd10DiagnosticGroupId
                               join icd in _icd10CodeRepository on map.Icd10CodeId equals icd.Icd10CodeId
                               join sub in _icd10SubCategoryRepository on icd.Icd10SubCategoryId equals sub.Icd10SubCategoryId
                               join cat in _icd10CategoryRepository on sub.Icd10CategoryId equals cat.Icd10CategoryId
                               where map.EventType == icd10CodeModel.EventType && drg.Icd10DiagnosticGroupId == icd10CodeModel.Icd10DiagnosticGroupId
                                && map.IsActive && drg.IsActive && icd.IsActive && sub.IsActive && cat.IsActive
                               select new ICD10Category
                               {
                                   Icd10CategoryId = cat.Icd10CategoryId,
                                   Icd10CategoryCode = cat.Icd10CategoryCode,
                                   Icd10CategoryDescription = cat.Icd10CategoryDescription,
                                   IsActive = cat.IsActive,
                                   CreatedBy = cat.CreatedBy,
                                   CreatedDate = cat.CreatedDate,
                                   ModifiedBy = cat.ModifiedBy,
                                   ModifiedDate = cat.ModifiedDate
                               }).Distinct().ToListAsync();
            }
        }

        public async Task<List<ICD10DiagnosticGroup>> GetICD10DiagonosticGroupsByEventType(EventTypeEnum eventType)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                               from map in _icd10GroupMapRepository
                               join drg in _icd10DiagnosticGroupRepository on map.Icd10DiagnosticGroupId equals drg.Icd10DiagnosticGroupId
                               where map.EventType == eventType && map.IsActive && drg.IsActive
                               select new ICD10DiagnosticGroup
                               {
                                   Icd10DiagnosticGroupId = drg.Icd10DiagnosticGroupId,
                                   Code = drg.Code,
                                   Description = drg.Description,
                                   IsActive = drg.IsActive,
                                   CreatedBy = drg.CreatedBy,
                                   CreatedDate = drg.CreatedDate,
                                   ModifiedBy = drg.ModifiedBy,
                                   ModifiedDate = drg.ModifiedDate
                               }).Distinct().ToListAsync();
            }
        }

        public async Task<List<ICD10CodeGroupMapping>> GetICD10DiagonosticGroupMapId(EventTypeEnum eventType, List<string> icd10Code, int icd10DiagnosticGroupId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (
                               from map in _icd10GroupMapRepository
                               join icd in _icd10CodeRepository on map.Icd10CodeId equals icd.Icd10CodeId
                               where map.EventType == eventType && map.Icd10DiagnosticGroupId == icd10DiagnosticGroupId && icd10Code.Contains(icd.Icd10Code)
                               && map.IsActive && icd.IsActive
                               select new ICD10CodeGroupMapping
                               {
                                   Icd10GroupMapId = map.Icd10GroupMapId
                               }).Distinct().ToListAsync();
                return result;
            }
        }
        /* 

-- EventType > DRG Group > category > subcate > ICD10 code 
        1, Pss eventtypeId> return DRGgroups ==== DONE
        2, Pss drggroupId > return list<icd10categories> ==== DONE
        3, Pss icd10categoryId > return list<icd10Subcategories> ==== DONE
        4, Pss icd10Subcategorid > return list<icd10codes> ==== DONE
         * 
         */

        public async Task<List<ICD10CodeModel>> FilterICD10Code(string filter)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                               from map in _icd10GroupMapRepository
                               join drg in _icd10DiagnosticGroupRepository on map.Icd10DiagnosticGroupId equals drg.Icd10DiagnosticGroupId
                               join icd in _icd10CodeRepository on map.Icd10CodeId equals icd.Icd10CodeId
                               join sub in _icd10SubCategoryRepository on icd.Icd10SubCategoryId equals sub.Icd10SubCategoryId
                               join cat in _icd10CategoryRepository on sub.Icd10CategoryId equals cat.Icd10CategoryId
                               where (icd.Icd10Code + " - " + icd.Icd10CodeDescription + " ( " + drg.Code + " - " + drg.Description + " )").Contains(filter)
                                && map.IsActive && drg.IsActive && icd.IsActive
                               select new ICD10CodeModel
                               {
                                   Icd10CodeId = icd.Icd10CodeId,
                                   Icd10Code = icd.Icd10Code,
                                   Icd10CodeDescription = icd.Icd10CodeDescription,
                                   Icd10SubCategoryId = icd.Icd10SubCategoryId,
                                   Icd10SubCategoryCode = sub.Icd10SubCategoryCode,
                                   Icd10SubCategoryDescription = sub.Icd10SubCategoryDescription,
                                   Icd10CategoryId = cat.Icd10CategoryId,
                                   Icd10CategoryCode = cat.Icd10CategoryCode,
                                   Icd10CategoryDescription = cat.Icd10CategoryDescription,
                                   Icd10DiagnosticGroupId = drg.Icd10DiagnosticGroupId,
                                   Icd10DiagnosticGroupCode = drg.Code,
                                   Icd10DiagnosticGroupDescription = drg.Description,
                                   DisplayValue = icd.Icd10Code + " - " + icd.Icd10CodeDescription + " ( " + drg.Code + " - " + drg.Description + " )",
                                   IsActive = icd.IsActive,
                                   EventType = map.EventType
                               }).Distinct().ToListAsync();
            }
        }

        public async Task<PagedRequestResult<ICD10Code>> PagedICD10Code(PagedRequest pagedRequest, int? subCategoryId, EventTypeEnum eventType)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _icd10CodeRepository.Join(_icd10GroupMapRepository, icd => icd.Icd10CodeId, gm => gm.Icd10CodeId, (icd, gm) => new
                {
                    Icd10CodeId = icd.Icd10CodeId,
                    Icd10Code = icd.Icd10Code,
                    Icd10CodeDescription = icd.Icd10CodeDescription,
                    Icd10SubCategoryId = icd.Icd10SubCategoryId,
                    Icd10SubCategoryCode = icd.Icd10SubCategory.Icd10SubCategoryCode,
                    Icd10SubCategoryDescription = icd.Icd10SubCategory.Icd10SubCategoryDescription,
                    DisplayValue = icd.Icd10Code + " - " + icd.Icd10CodeDescription,
                    IsActive = icd.IsActive,
                    EventType = gm.EventType,
                    Icd10DiagnosticGroupId = gm.Icd10DiagnosticGroupId,
                    Icd10CategoryId = icd.Icd10SubCategory.Icd10CategoryId
                })
                        .Where(icd => icd.IsActive &&
                        icd.EventType == eventType &&
                        (icd.Icd10SubCategoryId == subCategoryId.Value || subCategoryId.Value == 0) &&
                        (string.IsNullOrEmpty(pagedRequest.SearchCriteria) || icd.Icd10Code.Contains(pagedRequest.SearchCriteria)
                        || icd.Icd10SubCategoryCode.Contains(pagedRequest.SearchCriteria)
                        || icd.Icd10CodeDescription.Contains(pagedRequest.SearchCriteria)
                        || icd.Icd10SubCategoryDescription.Contains(pagedRequest.SearchCriteria)))
                         .Select(a => new ICD10Code()
                         {
                             Icd10CodeId = a.Icd10CodeId,
                             Icd10Code = a.Icd10Code,
                             Icd10CodeDescription = a.Icd10CodeDescription,
                             Icd10SubCategoryId = a.Icd10SubCategoryId,
                             Icd10SubCategoryDescription = a.Icd10SubCategoryDescription,
                             Icd10DiagnosticGroupId = a.Icd10DiagnosticGroupId,
                             Icd10CategoryId = a.Icd10CategoryId,
                             IsActive = a.IsActive,
                             BodySideAffected = null,
                             Severity = null
                         }).ToPagedResult(pagedRequest);

                return new PagedRequestResult<ICD10Code>()
                {
                    PageSize = result.PageSize,
                    Page = result.Page,
                    PageCount = result.PageCount,
                    RowCount = result.RowCount,
                    Data = result.Data
                };
            }
        }

        public async Task<List<ICD10SubCategory>> GetICD10SubCategoriesByEventType(EventTypeEnum eventType)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                                from map in _icd10GroupMapRepository
                                join drg in _icd10DiagnosticGroupRepository on map.Icd10DiagnosticGroupId equals drg.Icd10DiagnosticGroupId
                                join icd in _icd10CodeRepository on map.Icd10CodeId equals icd.Icd10CodeId
                                join sub in _icd10SubCategoryRepository on icd.Icd10SubCategoryId equals sub.Icd10SubCategoryId
                                join cat in _icd10CategoryRepository on sub.Icd10CategoryId equals cat.Icd10CategoryId
                                where map.EventType == eventType
                                 && map.IsActive && drg.IsActive && icd.IsActive && sub.IsActive && cat.IsActive
                                select new ICD10SubCategory
                                {
                                    Icd10SubCategoryId = sub.Icd10SubCategoryId,
                                    Icd10CategoryId = sub.Icd10CategoryId,
                                    Icd10SubCategoryCode = sub.Icd10SubCategoryCode,
                                    Icd10SubCategoryDescription = sub.Icd10SubCategoryDescription,
                                    IsActive = sub.IsActive,
                                    CreatedBy = sub.CreatedBy,
                                    CreatedDate = sub.CreatedDate,
                                    ModifiedBy = sub.ModifiedBy,
                                    ModifiedDate = sub.ModifiedDate
                                }).Distinct().ToListAsync();
            }
        }

        public async Task<List<ICD10SubCategory>> GetICD10SubCategoryListByEventType(EventTypeEnum eventType)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                                from map in _icd10GroupMapRepository
                                join drg in _icd10DiagnosticGroupRepository on map.Icd10DiagnosticGroupId equals drg.Icd10DiagnosticGroupId
                                join icd in _icd10CodeRepository on map.Icd10CodeId equals icd.Icd10CodeId
                                join sub in _icd10SubCategoryRepository on icd.Icd10SubCategoryId equals sub.Icd10SubCategoryId
                                join cat in _icd10CategoryRepository on sub.Icd10CategoryId equals cat.Icd10CategoryId
                                where map.EventType == eventType
                                 && map.IsActive && drg.IsActive && icd.IsActive && sub.IsActive && cat.IsActive
                                select new ICD10SubCategory
                                {
                                    Icd10SubCategoryId = sub.Icd10SubCategoryId,
                                    Icd10CategoryId = sub.Icd10CategoryId,
                                    Icd10SubCategoryCode = sub.Icd10SubCategoryCode,
                                    Icd10SubCategoryDescription = sub.Icd10SubCategoryDescription,
                                    Icd10Code = icd.Icd10Code,
                                    IsActive = sub.IsActive,
                                    CreatedBy = sub.CreatedBy,
                                    CreatedDate = sub.CreatedDate,
                                    ModifiedBy = sub.ModifiedBy,
                                    ModifiedDate = sub.ModifiedDate
                                }).Distinct().ToListAsync();
            }
        }

        public async Task<int> GetICD10DiagnosticGroupByCode(string icd10DiagnosticGroupcode)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var icd10DiagnosticGroup = await _icd10DiagnosticGroupRepository.FirstOrDefaultAsync(i => i.Code == icd10DiagnosticGroupcode);
                return icd10DiagnosticGroup.Icd10DiagnosticGroupId;
            }
        }

        public async Task<List<ICD10Code>> GetICD10Codes(string icd10CodeIds)
        {
            Contract.Requires(icd10CodeIds != null);
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var icd10CodeIdList = icd10CodeIds.Split(',').Select(Int32.Parse).ToList();
                var icd10Codes = await _icd10CodeRepository.Where(i => icd10CodeIdList.Contains(i.Icd10CodeId)).ToListAsync();
                return Mapper.Map<List<ICD10Code>>(icd10Codes);
            }
        }

        public async Task<bool> FindICD10CodePractitionerTypeMapping(int practitionerTypeId, List<InvoiceLineICD10Code> icd10Codes)
        {
            Contract.Requires(icd10Codes!=null);
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var practitionerTypeExclusion = await _practitionerTypeIcd10ValidationExclusionRepository
                    .Where(a => a.IsActive && a.PractitionerTypeId == practitionerTypeId).FirstOrDefaultAsync();

                if (practitionerTypeExclusion != null)
                    return true;

                foreach (var icd10Code in icd10Codes)
                {
                    var mapping = await _practitionerTypeRCodeMappingRepository
                    .Where(a => a.IsActive && a.PractitionerTypeId == practitionerTypeId && a.Icd10Code == icd10Code.Icd10Code).FirstOrDefaultAsync();
                    if (mapping != null)
                    {
                        return true;
                    }
                }
            }

            return false;
        }


        public async Task<bool> IsOnlyExternalICD10CauseCodeSupplied(List<int> icd10CodeIdList)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var result = await (
                            from icd in _icd10CodeRepository
                            join map in _icd10GroupMapRepository on icd.Icd10CodeId equals map.Icd10CodeId
                            join drg in _icd10DiagnosticGroupRepository on map.Icd10DiagnosticGroupId equals drg.Icd10DiagnosticGroupId
                            where !(drg.Code.Equals(MediCareConstants.SequelaeDRGCode) || drg.Code.Equals(MediCareConstants.ExternalCausesDRGCode)) && icd10CodeIdList.Contains(icd.Icd10CodeId)
                                && map.IsActive && icd.IsActive
                            select new ICD10Code
                            {
                                Icd10CodeId = icd.Icd10CodeId
                            })
                            .Distinct()
                            .ToListAsync();

                return result.Count <= 0;
            }
        }

        public async Task<PagedRequestResult<ICD10Code>> PagedICD10CodeClaims(PagedRequest pagedRequest, EventTypeEnum eventType)
        {
            Contract.Requires(pagedRequest != null);
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var icdCodes = pagedRequest.SearchCriteria?.Split(',').ToList();

                PagedRequestResult<ICD10Code> result;

                if (icdCodes == null || icdCodes.Count == 0)
                {
                    result = await _icd10CodeRepository.Join(_icd10GroupMapRepository, icd => icd.Icd10CodeId, gm => gm.Icd10CodeId, (icd, gm) => new
                    {
                        Icd10CodeId = icd.Icd10CodeId,
                        Icd10Code = icd.Icd10Code,
                        Icd10CodeDescription = icd.Icd10CodeDescription,
                        Icd10SubCategoryId = icd.Icd10SubCategoryId,
                        Icd10SubCategoryCode = icd.Icd10SubCategory.Icd10SubCategoryCode,
                        Icd10SubCategoryDescription = icd.Icd10SubCategory.Icd10SubCategoryDescription,
                        DisplayValue = icd.Icd10Code + " - " + icd.Icd10CodeDescription,
                        IsActive = icd.IsActive,
                        EventType = gm.EventType
                    })
                            .Where(icd => icd.IsActive &&
                            icd.EventType == eventType)
                             .Select(a => new ICD10Code()
                             {
                                 Icd10CodeId = a.Icd10CodeId,
                                 Icd10Code = a.Icd10Code,
                                 Icd10CodeDescription = a.Icd10CodeDescription,
                                 Icd10SubCategoryId = a.Icd10SubCategoryId,
                                 Icd10SubCategoryDescription = a.Icd10SubCategoryDescription,
                                 IsActive = a.IsActive,
                             }).ToPagedResult(pagedRequest);
                }
                else
                {
                    result = await _icd10CodeRepository.Join(_icd10GroupMapRepository, icd => icd.Icd10CodeId, gm => gm.Icd10CodeId, (icd, gm) => new
                    {
                        Icd10CodeId = icd.Icd10CodeId,
                        Icd10Code = icd.Icd10Code,
                        Icd10CodeDescription = icd.Icd10CodeDescription,
                        Icd10SubCategoryId = icd.Icd10SubCategoryId,
                        Icd10SubCategoryCode = icd.Icd10SubCategory.Icd10SubCategoryCode,
                        Icd10SubCategoryDescription = icd.Icd10SubCategory.Icd10SubCategoryDescription,
                        DisplayValue = icd.Icd10Code + " - " + icd.Icd10CodeDescription,
                        IsActive = icd.IsActive,
                        EventType = gm.EventType
                    })
                            .Where(icd => icd.IsActive &&
                            icd.EventType == eventType &&
                            (string.IsNullOrEmpty(pagedRequest.SearchCriteria) || icdCodes.Contains(icd.Icd10Code)))
                             .Select(a => new ICD10Code()
                             {
                                 Icd10CodeId = a.Icd10CodeId,
                                 Icd10Code = a.Icd10Code,
                                 Icd10CodeDescription = a.Icd10CodeDescription,
                                 Icd10SubCategoryId = a.Icd10SubCategoryId,
                                 IsActive = a.IsActive,
                             }).ToPagedResult(pagedRequest);
                }

                return new PagedRequestResult<ICD10Code>()
                {
                    PageSize = result.PageSize,
                    Page = result.Page,
                    PageCount = result.PageCount,
                    RowCount = result.RowCount,
                    Data = result.Data
                };
            }
        }

        public async Task<List<ICD10Code>> GetICD10CodesDescription(List<string> icd10CodesLines)
        {
            Contract.Requires(icd10CodesLines != null);
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var icd10CodesListReturned = new List<ICD10Code>();
                foreach (var icd10CodesPerLine in icd10CodesLines)
                {
                    var icd10Codes = icd10CodesPerLine.Split('/').Select(p => p.Trim()).ToList();
                    string fullICD10CodesDescription = "";

                    for (int i = 0; i < icd10Codes.Count; i++)
                    {
                        string icd10Code = icd10Codes[i];
                        var lineIcd10CodesDescription = Mapper.Map<ICD10Code>(await _icd10CodeRepository.Where(x => x.Icd10Code == icd10Code).FirstOrDefaultAsync());

                        if (lineIcd10CodesDescription != null && ValidationUtils.CheckICD10CodeFormat(icd10Codes[i]) && lineIcd10CodesDescription.Icd10Code == icd10Code)
                        {
                            fullICD10CodesDescription += string.IsNullOrEmpty(lineIcd10CodesDescription.Icd10Code) ?
                                lineIcd10CodesDescription.Icd10Code + " : Not RMA Liability" :
                                lineIcd10CodesDescription.Icd10Code + " : " + lineIcd10CodesDescription.Icd10CodeDescription;

                            fullICD10CodesDescription += " ; ";
                        }
                        else
                        {
                            fullICD10CodesDescription += icd10Code + " : Invalid format ;";
                        }
                    }

                    icd10CodesListReturned.Add(new ICD10Code
                    {
                        Icd10CodeId = 0,
                        Icd10Code = "",
                        Icd10CodeDescription = fullICD10CodesDescription,
                        Icd10SubCategoryId = 0
                    });
                }

                return icd10CodesListReturned;
            }
        }

        public async Task<PagedRequestResult<ICD10SubCategory>> GetPagedICD10SubCategories(PagedRequest pagedRequest)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var filter = !string.IsNullOrEmpty(pagedRequest.SearchCriteria) ? Convert.ToString(pagedRequest.SearchCriteria).ToUpper() : string.Empty;

                var icd10SubCategories = new PagedRequestResult<medical_Icd10SubCategory>();

                if (!string.IsNullOrEmpty(filter))
                {
                    icd10SubCategories = await (from icd10SubCategory in _icd10SubCategoryRepository
                                                where (
                                                        icd10SubCategory.Icd10SubCategoryCode.Contains(filter) ||
                                                         icd10SubCategory.Icd10SubCategoryDescription.Contains(filter)
                                                      )
                                                select icd10SubCategory).ToPagedResult(pagedRequest);
                }
                else
                {
                    icd10SubCategories = await (from icd10SubCategory in _icd10SubCategoryRepository
                                                select icd10SubCategory).ToPagedResult(pagedRequest);
                }

                var data = Mapper.Map<List<ICD10SubCategory>>(icd10SubCategories.Data);

                return new PagedRequestResult<ICD10SubCategory>
                {
                    Data = data,
                    RowCount = icd10SubCategories.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(icd10SubCategories.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<List<ICD10CodeMatch>> CheckICD10CodeMatchInjurygrouping(string icd10Codes, int personEventId, int healthCareProviderId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = new List<ICD10CodeMatch>();
                SqlParameter[] parameters = {
                    new SqlParameter("ICD10Code", icd10Codes),
                    new SqlParameter("PersonEventID", personEventId),
                    new SqlParameter("MedicalServiceProviderID", healthCareProviderId),
                    new SqlParameter("IsValid", SqlDbType.Bit)
                };

                parameters[3].Direction = ParameterDirection.Output;
                results = await _icd10CodeRepository.SqlQueryAsync<ICD10CodeMatch>(DatabaseConstants.CheckICD10CodeMatchInjurygrouping, parameters);
                return results;
            }
        }

    }
}

