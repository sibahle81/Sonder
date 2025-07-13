using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.CompCare;

using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.CompCare
{
    public interface IMedicalReportService : IService
    {
        Task<RootMedicalReportSubmissionResponse> SubmitCompCareMedicalReport(RootMedicalReportSubmissionRequest request);
    }
}
