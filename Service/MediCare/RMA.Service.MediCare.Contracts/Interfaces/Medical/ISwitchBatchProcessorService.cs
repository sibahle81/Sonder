using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface ISwitchBatchProcessorService : IService
    {
        Task<bool> CheckIfBatchExists(string switchBatchNumber, int switchId);
        Task<int> WriteInvoicesToDatabase(SwitchBatch switchBatch);
        Task<Dictionary<string, string>> ValidateICD10Codes(string fileRefNumber, SwitchBatchInvoiceLine switchBatchInvoiceLine);
        Task<decimal> DeriveVATFromAmountInclusiveOfVAT(decimal amountInclusiveOfVAT, DateTime serviceDate);
        Task<decimal> DeriveAmountExcludingVATFromAmountInclusiveOfVAT(decimal amountInclusiveOfVAT, DateTime serviceDate);
    }
}
