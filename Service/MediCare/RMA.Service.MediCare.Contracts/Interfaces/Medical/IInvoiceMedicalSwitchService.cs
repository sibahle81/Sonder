using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IInvoiceMedicalSwitchService : IService
    {
        Task<List<SwitchBatch>> GetMedicalSwitchBatchList(MedicalInvoiceSearchBatchCriteria searchBatchSearchCrateria);
        Task<PagedRequestResult<SwitchBatch>> GetPagedMedicalSwitchBatchList(SwitchBatchPagedRequest request);
        Task<List<SwitchBatchInvoice>> GetUnmappedMiSwitchRecords(MedicalSwitchBatchUnmappedParams medicalSwitchBatchUnmappedParams);
        Task<List<SwitchBatchInvoice>> GetMedicalSwitchBatchInvoices(int switchBatchId);
        Task<List<MISwitchBatchDeleteReason>> GetSwitchBatchesDeleteReasons();
        Task<int> EditSwitchBatchAssignToUser(SwitchBatch switchBatchInvoice);
        Task<int> DeleteSwitchBatchInvoice(int switchBatchInvoiceId);
        Task<int> SendSwitchBatchValidationRequests(int switchBatchId);
        Task<List<SwitchUnderAssessReasonSetting>> GetManualSwitchBatchDeleteReasons();
        Task<int> SaveManualSwitchBatchDeleteReasonToDB(SwitchBatchDeleteReason switchBatchDeleteReason);
        Task<bool> ReinstateSwitchBatchInvoices(SwitchBatchInvoiceReinstateParams switchBatchInvoiceReinstateParams);
        Task CreateMedicalInvoices();
        Task ValidateSwitchBatchInvoice(int switchBatchInvoiceId);
    }
}
