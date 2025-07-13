using Microsoft.ServiceFabric.Services.Remoting;

using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IDocumentNumberService : IService
    {
        Task<string> GenerateCreditNoteDocumentNumber();
        Task<string> GenerateDebitNoteDocumentNumber();
        Task<string> GenerateInvoiceDocumentNumber();
        Task<string> GenerateInterestDocumentNumber();
        Task<string> GenerateCreditReallocationDocumentNumber();
        Task<string> GenerateWriteOffDocumentNumber();
        Task<string> GenerateRefundDocumentNumber();
        Task<string> GenerateReinstateDocumentNumber();
    }
}
