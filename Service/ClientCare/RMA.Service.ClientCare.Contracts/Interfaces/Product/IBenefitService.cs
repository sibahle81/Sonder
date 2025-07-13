using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IBenefitService : IService
    {
        Task<List<Benefit>> GetBenefits();
        Task<List<Benefit>> GetBenefitsByProductId(int productid);
        Task<Benefit> GetBenefit(int id);
        Task<Benefit> GetBenefitAtEffectiveDate(int id, DateTime effectiveDate);
        Task<Benefit> GetBenefitByName(string name);
        Task<int> AddBenefit(Benefit benefit, int? wizardId);
        Task EditBenefit(Benefit benefit, int? wizardId);
        Task<List<Lookup>> GetBenefitTypes();
        Task<List<Lookup>> GetDisabilityBenefitTerms();
        Task<List<Lookup>> GetCoverMemberTypes();
        Task<PagedRequestResult<Benefit>> SearchBenefits(PagedRequest query);
        Task<List<Benefit>> GetBenefitsByBenefitIds(List<int> ids);
        Task<List<Lookup>> GetEarningTypes();
        Task<Benefit> GetMedicalBenefit(int benefitId, string name);
        Task<ImportBenefitsSummary> UploadBenefits(FileContentImport content);
        Task<PagedRequestResult<BenefitsUploadErrorAuditDetails>> GetPagedBenefitsErrorAudit(PagedRequest request);
        Task<ProductOption> GetProductBenefitRates(int productOptionId, int coverMemberTypeId);
    }
}