using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Utils;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class SwitchBatchProcessorFacade : RemotingStatelessService, ISwitchBatchProcessorService
    {
        private readonly ISwitchBatchService _switchBatchService;
        private readonly IVatService _vatService;
        private readonly IInvoiceService _invoiceService;
        private readonly IMediCareService _mediCareService;

        public SwitchBatchProcessorFacade(StatelessServiceContext context
            , ISwitchBatchService switchBatchService
            , IVatService vatService
            , IInvoiceService invoiceService
            , IMediCareService mediCareService)
            : base(context)
        {
            _switchBatchService = switchBatchService;
            _vatService = vatService;
            _invoiceService = invoiceService;
            _mediCareService = mediCareService;
        }

        public async Task<bool> CheckIfBatchExists(string switchBatchNumber, int switchId)
        {
            var switchBatchResult = await _switchBatchService.GetSwitchBatchDetail(switchBatchNumber, switchId);
            if (switchBatchResult != null)
            {
                string message = "Cannot process this " + switchBatchResult.SwitchFileName + " batch : " + switchBatchNumber + " as batch already exists!";
                return true;
            }
            return false;
        }

        public async Task<int> WriteInvoicesToDatabase(SwitchBatch switchBatch)
        {
            if (switchBatch == null)
                return 0;

            var switchBatchId = await _switchBatchService.AddSwitchBatch(switchBatch);
            switchBatch.SwitchBatchId = switchBatchId;

            var savedSwitchBatch = await _switchBatchService.GetSwitchBatch(switchBatchId);
            foreach (var switchBatchInvoice in savedSwitchBatch.SwitchBatchInvoices)
            {
                var producer = new ServiceBusQueueProducer<SwitchBatchInvoiceMessage, SwitchBatchInvoiceQueueListener>(SwitchBatchInvoiceQueueListener.QueueName);
                await producer.PublishMessageAsync(new SwitchBatchInvoiceMessage()
                {
                    SwitchBatchInvoiceId = switchBatchInvoice.SwitchBatchInvoiceId,
                    ImpersonateUser = SystemSettings.SystemUserAccount
                });
            }

            return switchBatchId;
        }

        public async Task<Dictionary<string, string>> ValidateICD10Codes(string fileRefNumber, SwitchBatchInvoiceLine switchBatchInvoiceLine)
        {
            Contract.Requires(switchBatchInvoiceLine != null);
            var results = ValidateICD10CodeFormat(switchBatchInvoiceLine.Icd10Code);
            var errorMessages = new List<string>();
            var underAssessReasonIds = new List<int>();

            foreach (var item in results)
            {
                underAssessReasonIds.Add(0); // Update value from the UnderAssessReasonId table
                errorMessages.Add(item.Value);
            }
            return results;
        }

        public (bool isValid, string message) ValidateICD10CodesFormat(string ICD10Code)
        {
            bool isValid = false;
            string message = string.Empty;

            Dictionary<string, string> resourceKeys = ValidateICD10CodeFormat(ICD10Code);

            if (resourceKeys.Count <= 0)
            {
                isValid = true;
            }
            else
            {
                List<string> errorMessages = new List<string>();

                foreach (var item in resourceKeys)
                {
                    errorMessages.Add(item.Value);
                }

                message = string.Join(", ", errorMessages);
            }

            return (isValid, message);
        }

        public Dictionary<string, string> ValidateICD10CodeFormat(string ICD10Code)
        {
            Dictionary<string, string> resourceKeys = new Dictionary<string, string>();

            if (string.IsNullOrEmpty(ICD10Code?.Trim()))
            {
                resourceKeys.Add("ICDE0000", "ICD10Code not supplied");
            }
            else
            {
                if (ICD10Code.Trim().Length > 50)
                {
                    resourceKeys.Add("ICDE0007", "ICD10Codes exceeds the allowable length");
                }
                else
                {
                    string[] lstICD10Code = ICD10Code?.Trim().Split(new char[] { '/', ' ' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (string icd10 in lstICD10Code)
                    {
                        if (!ValidationUtils.CheckICD10CodeFormat(icd10.Trim()))
                        {
                            resourceKeys.Add("ICDE0001", "ICD10Codes not in a correct format");
                        }
                    }
                }
            }

            return resourceKeys;
        }

        public async Task<decimal> DeriveVATFromAmountInclusiveOfVAT(decimal amountInclusiveOfVAT, DateTime serviceDate)
        {
            decimal vat;

            try
            {
                vat = amountInclusiveOfVAT - (amountInclusiveOfVAT / GetVatPercentagePlus1(serviceDate));
            }
            catch (Exception)
            {
                vat = 0;
            }

            return vat;
        }

        public async Task<decimal> DeriveAmountExcludingVATFromAmountInclusiveOfVAT(decimal amountInclusiveOfVAT, DateTime serviceDate)
        {
            decimal amountExcludingVAT;

            try
            {
                amountExcludingVAT = amountInclusiveOfVAT / GetVatPercentagePlus1(serviceDate);
            }
            catch (Exception)
            {
                amountExcludingVAT = 0;
            }

            return Math.Round(amountExcludingVAT, 2);
        }

        private decimal GetVatPercentagePlus1(DateTime serviceDate)
        {
            var vatRate = _vatService.GetVatAmount(1, serviceDate);
            return (vatRate.Result / 100M) + 1;
        }

    }
}
