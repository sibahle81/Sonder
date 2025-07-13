using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IInvoiceHelperService : IService
    {
        Task<List<InvoiceUnderAssessReason>> AutoPayRun(int invoiceId, int tebaInvoiceId);
        Task<List<InvoiceUnderAssessReason>> AutoPayRunSTPIntegration(int invoiceId);
        Task<List<InvoiceUnderAssessReason>> ReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId);
        Task<bool> AutoReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId, int personEventId);
        Task<List<InvoiceDetails>> GetValidatedSTPInvoicesNotMappedToPreAuth();
        Task<int> AddInvoice(Invoice invoice);
        Task<int> AddTebaInvoice(TebaInvoice tebaInvoice);
        //helpers to access common via
        Task<int> EditInvoiceStatusHelper(Invoice invoice);
        Task<int> EditTebaInvoiceStatusHelper(TebaInvoice tebaInvoice);
        Task<TebaInvoice> GetTebaInvoiceHelper(int tebaInvoiceId);
        Task<InvoiceStatusEnum> GetInvoiceStatusForUnderAssessReasonssHelper(int invoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons, InvoiceStatusEnum invoiceStatus);
        Task<int> EditInvoiceHelper(Invoice invoice);
        Task<int> EditTebaInvoiceHelper(TebaInvoice tebaInvoice);
        Task<InvoiceValidationModel> ExecuteInvoiceValidationsHelper(InvoiceDetails invoiceDetails);
        Task<InvoiceValidationModel> ExecuteTebaInvoiceValidationsHelper(TebaInvoice tebaInvoice);
        Task<InvoiceValidationModel> ExecuteTebaInvoiceLineValidationsHelper(TebaInvoice tebaInvoice);
        Task SaveInvoiceLineUnderAssessReasonsToDBHelper(List<InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasons);
        Task SaveInvoiceUnderAssessReasonsToDBHelper(int invoiceId, int tebaInvoiceId, List<InvoiceUnderAssessReason> invoiceUnderAssessReasons);
        Task<int> ProcessMedicalInvoiceIntegrationMessage(string message, string messageId);
        Task<bool> ForceReinstateMedicalInvoice(int invoiceId, int tebaInvoiceId);
        Task<bool> MapSwitchBatchInvoice(SwitchBatchInvoiceMapParams switchBatchInvoiceMapParams);
        Task<List<Invoice>> GetCapturedInvoices();
        Task<List<TebaInvoice>> GetCapturedTebaInvoices();
        Task<List<InvoiceUnderAssessReason>> ValidateInvoiceRun(int invoiceId, int tebaInvoiceId);
    }
}
