using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IInvoiceService : IService
    {
        Task<List<Invoice>> GetInvoices();
        Task<Invoice> GetInvoice(int invoiceId);
        Task<string> ValidateTariffCode(string itemCode, int practitionerTypeId, DateTime serviceDate);
        Task<bool> MedicalInvoiceStatusUpdates(string procedureName);
        Task<bool> CreateAssessmentWizard(Invoice invoice);
    }
}
