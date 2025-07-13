using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IICD10CodeService : IService
    {
        Task<ICD10Code> GetICD10CodeById(int icd10CodeId);
        Task<ICD10DiagnosticGroup> GetICD10DiagnosticGroup(int icd10DiagnosticGroupId);
        Task<List<ICD10Code>> GetICD10CodesByEventTypeDRGAndSubCategory(ICD10CodeModel icd10CodeModel);
        Task<List<ICD10SubCategory>> GetICD10SubCategoriesByEventTypeDRGAndCategory(ICD10CodeModel icd10CodeModel);
        Task<List<ICD10Category>> GetICD10CategoriesByEventTypeAndDiagnosticGroup(ICD10CodeModel icd10CodeModel);
        Task<List<ICD10DiagnosticGroup>> GetICD10DiagonosticGroupsByEventType(EventTypeEnum eventType);
        Task<List<ICD10CodeGroupMapping>> GetICD10DiagonosticGroupMapId(EventTypeEnum eventType, List<string> icd10Code, int icd10DiagnosticGroupId);
        Task<List<ICD10CodeModel>> FilterICD10Code(string filter);
        Task<PagedRequestResult<ICD10Code>> PagedICD10Code(PagedRequest pagedRequest, int? subCategoryId, EventTypeEnum eventType);
        Task<List<ICD10SubCategory>> GetICD10SubCategoriesByEventType(EventTypeEnum eventType);
        Task<int> GetICD10DiagnosticGroupByCode(string icd10DiagnosticGroupcode);
        Task<List<ICD10Code>> GetICD10Codes(string icd10CodeIds);
        Task<bool> FindICD10CodePractitionerTypeMapping(int practitionerTypeId, List<InvoiceLineICD10Code> icd10Codes);
        Task<bool> IsOnlyExternalICD10CauseCodeSupplied(List<int> icd10CodeIdList);
        Task<List<ICD10Code>> GetICD10CodesDescription(List<string> icd10CodesLines);
        Task<PagedRequestResult<ICD10Code>> PagedICD10CodeClaims(PagedRequest pagedRequest, EventTypeEnum eventType);
        Task<List<ICD10SubCategory>> GetICD10SubCategoryListByEventType(EventTypeEnum eventType);
        Task<PagedRequestResult<ICD10SubCategory>> GetPagedICD10SubCategories(PagedRequest request);
        Task<List<ICD10CodeMatch>> CheckICD10CodeMatchInjurygrouping(string icd10Codes, int personEventId, int healthCareProviderId);
    }
}
