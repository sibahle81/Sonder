using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IPreAuthHelperService : IService
    {
        Task<PreAuthorisation> GetPreAuthDetails(string preAuthNumber, int preAuthId);
        Task<string> GetMaskedPreAuthNumber(string unmaskedPreAuthNumber, PreAuthStatusEnum? preAuthStatusId);
        Task<List<string>> CheckPreAuthValidations(PreAuthorisation preAuth);

        Task<List<PreAuthBreakdownUnderAssessReason>> BuildPreAuthBreakdownUnderAssessReasonList(
            PreAuthorisation preAuth);

        Task<int> SavePreAuthBreakdownUnderAssessReason(
            List<PreAuthBreakdownUnderAssessReason> preAuthBreakdownUnderAssessReason, bool checkOnEditPreAuth);

        Task<PreAuthorisationBreakdown> CreateNewPreAuthBreakdownItemWithLevelOfCare(PreAuthorisation preAuth,
            PreAuthorisationBreakdown lineItem);

        Task<List<WorkPool>> ProcessMedicalBusinessResult(List<WorkPool> workPoolList);
        Task<PreAuthorisation> GetPreAuthorisation(string preAuthNumber);
    }
}
