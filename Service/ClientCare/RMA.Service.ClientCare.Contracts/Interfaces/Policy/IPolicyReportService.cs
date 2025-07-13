using Microsoft.ServiceFabric.Services.Remoting;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyReportService : IService
    {
        Task<bool> SendCorporatePaymentFiles();
    }
}
