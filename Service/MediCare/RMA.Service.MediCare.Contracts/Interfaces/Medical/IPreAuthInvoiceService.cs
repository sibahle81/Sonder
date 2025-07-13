using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IPreAuthInvoiceService : IService
    {
        Task<List<PreAuthorisation>> CheckIfPreAuthExists(MedicalPreAuthExistCheckParams medicalPreAuthExistCheckParams);
        Task<List<PreAuthorisation>> GetInvoiceMappedPreAuthorisations(List<int> preAuthIds);
        Task<PreAuthorisation> GetMedicalInvoicePreAuthorisationById(int preAuthorisationId);
    }
}
