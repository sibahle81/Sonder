using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Interfaces;

using System;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class DocumentNumberFacade : RemotingStatelessService, IDocumentNumberService
    {
        private readonly IDocumentGeneratorService _documentGeneratorService;
        public DocumentNumberFacade(StatelessServiceContext context,
               IDocumentGeneratorService documentGeneratorService) : base(context)
        {
            _documentGeneratorService = documentGeneratorService;
        }

        public async Task<string> GenerateCreditNoteDocumentNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.CreditNote, "");
        }

        public Task<string> GenerateCreditReallocationDocumentNumber()
        {
            throw new NotImplementedException();
        }

        public async Task<string> GenerateDebitNoteDocumentNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.DebitNote, "");
        }

        public async Task<string> GenerateInterestDocumentNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Interest, "");
        }

        public async Task<string> GenerateInvoiceDocumentNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Invoice, "");
        }

        public async Task<string> GenerateWriteOffDocumentNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.WriteOff, "");
        }

        public async Task<string> GenerateRefundDocumentNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Refund, "");
        }

        public async Task<string> GenerateReinstateDocumentNumber()
        {
            return await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Reinstate, "");
        }
    }
}
