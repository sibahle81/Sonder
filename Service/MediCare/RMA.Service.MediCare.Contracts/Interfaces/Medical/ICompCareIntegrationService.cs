using Microsoft.ServiceFabric.Services.Remoting;

using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ICompCareIntegrationService : IService
    {
        Task SendMedicalInvoiceResponseMessage(int invoiceId, Integrations.Contracts.Enums.ActionEnum action);
    }
}
