using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;

using System.Collections.Generic;
using System.Data.SqlClient;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class MedicalEstimatesFacade : RemotingStatelessService, IMedicalEstimatesService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_Icd10CodeEstimateLookup> _icd10CodeEstimateLookup;
        private readonly IRepository<claim_DaysOffLookup> _daysOffLookup;
        private readonly IRepository<claim_MedicalCostLookup> _medicalCostLookup;
        private readonly IRepository<claim_PdExtentLookup> _pdExtentLookups;

        public MedicalEstimatesFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_Icd10CodeEstimateLookup> icd10CodeEstimateLookup
            , IRepository<claim_DaysOffLookup> daysOffLookup
            , IRepository<claim_MedicalCostLookup> medicalCostLookup
            , IRepository<claim_PdExtentLookup> pdExtentLookups
            ) :
            base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _icd10CodeEstimateLookup = icd10CodeEstimateLookup;
            _daysOffLookup = daysOffLookup;
            _medicalCostLookup = medicalCostLookup;
            _pdExtentLookups = pdExtentLookups;
        }

        public async Task<List<Icd10CodeEstimateAmount>> GetICD10Estimates(ICD10EstimateFilter icd10EstimateFilter)
        {

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("EventTypeId", icd10EstimateFilter.EventType),
                    new SqlParameter("ICD10Codes", icd10EstimateFilter.Icd10Codes),
                    new SqlParameter("ReportDate", icd10EstimateFilter.ReportDate),
                };

                return await _icd10CodeEstimateLookup.SqlQueryAsync<Icd10CodeEstimateAmount>(DatabaseConstants.GetMedicalEstimateLookupStoredProcedure, parameters);

            }
        }

    }
}

