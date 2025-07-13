using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.CompCare;

using System.Threading.Tasks;


namespace RMA.Service.Integrations.Contracts.Interfaces.CompCare
{
    public interface ICCClaimService : IService
    {

        Task<RootCCClaimResponse> SendClaimRequest(RootCCClaimRequest request);
        Task<RootMedicalReportCategory> GetMedicalReportCategories();
        Task<RootMedicalReportType> GetMedicalReportTypes();

    }
}

