//using System;
//using System.Collections;
//using System.Collections.Generic;
//using System.Threading.Tasks;
//using RMA.Common.Security;
//using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
//using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
//using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
//using RMA.Service.Admin.RulesManager.Contracts.Entities;
//using RMA.Service.FinCare.Contracts.Entities.Billing;
//using RMA.Service.FinCare.Contracts.Enums;
//using RMA.Service.FinCare.Contracts.Interfaces.Billing;

//namespace RMA.Service.FinCare.BusinessProcessTasks.PaymentArrangement
//{
//    public class PaymentArrangement : IWizardProcess
//    {
//        private readonly IPaymentArrangementService _paymentArrangementService;
//        private readonly IPaymentArrangementDocumentService _paymentArrangementDocumentService;
//        private int _paymentArrangementId;

//        public PaymentArrangement(IPaymentArrangementService paymentArrangementService
//        , IPaymentArrangementDocumentService paymentArrangementDocumentService)
//        {
//            _paymentArrangementService = paymentArrangementService;
//            _paymentArrangementDocumentService = paymentArrangementDocumentService;
//        }

//        public async Task<int> StartWizard(IWizardContext context)
//        {
//            var qualifyResult = context.Deserialize<QualifyResult>(context.Data);
//            var name = $"Payment arrangement application - {qualifyResult.Client.Name} {qualifyResult.Client.LastName}";

//            var stepData = new ArrayList
//            {
//                qualifyResult,
//                null
//            };

//            var id = await context.CreateWizard(name, stepData);
//            return id;
//        }

//        public async Task<string> ChangeTheNameWizard(string data, int wizardid, string currentwizardname)
//        {
//            return string.Empty;
//        }

//        public async Task SubmitWizard(IWizardContext context)
//        {
//            var wizard = context.Deserialize<Wizard>(context.Data);
//            var stepData = context.Deserialize<ArrayList>(wizard.Data);
//            var qualifyResult = context.Deserialize<QualifyResult>(stepData[0].ToString());
//            var documents = context.Deserialize<List<UploadFile>>(stepData[1].ToString());
//            var paymentArrangement = new Contracts.Entities.Billing.PaymentArrangement
//            {
//                ClientId = qualifyResult.Client.Id,
//                Client = qualifyResult.Client,
//                StartDate = qualifyResult.StartDate,
//                Amount = qualifyResult.Amount,
//                PaymentFrequency = qualifyResult.PaymentFrequency,
//                PaymentArrangementStatus = PaymentArrangementStatusEnum.TermArrangementApproved,
//                IsActive = true
//            };

//            await AddPaymentArrangement(paymentArrangement);
//            await AddDocuments(documents);
//        }

//        public Task CancelWizard(IWizardContext context)
//        {
//            return Task.CompletedTask;
//        }

//        public Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
//        {
//            var ruleRequestResult = new RuleRequestResult { OverallSuccess = true };

//            var wizard = context.Deserialize<Wizard>(context.Data);
//            var stepData = context.Deserialize<ArrayList>(wizard.Data);
//            var documents = context.Deserialize<List<UploadFile>>(stepData[1].ToString());

//            var ruleResults = new List<RuleResult>();

//            if (documents.Count <= 0)
//            {
//                ruleRequestResult.OverallSuccess = false;

//                var ruleResult = new RuleResult
//                {
//                    Passed = false,
//                    RuleName = "Missing supporting documentation - Terms Agreement",
//                    MessageList = new List<string> { "A signed copy of the terms agreement must be uploaded before sending this payment arrangement application for approval" }
//                };
//                ruleResults.Add(ruleResult);
//            }

//            ruleRequestResult.RequestId = Guid.NewGuid();
//            ruleRequestResult.RuleResults = ruleResults;

//            return Task.FromResult(ruleRequestResult);
//        }

//        private async Task AddPaymentArrangement(Contracts.Entities.Billing.PaymentArrangement paymentArrangement)
//        {
//            _paymentArrangementId = await _paymentArrangementService.AddPaymentArrangement(paymentArrangement);
//        }

//        private async Task AddDocuments(List<UploadFile> uploadedFiles)
//        {
//            if (uploadedFiles == null || uploadedFiles.Count == 0)
//                return;

//            foreach (var uploadedFile in uploadedFiles)
//            {
//                var document = new PaymentArrangementDocument
//                {
//                    DocumentToken = uploadedFile.Token,
//                    Name = "Term Agreement",
//                    PaymentArrangementId = _paymentArrangementId,
//                    IsActive = true
//                };

//                await _paymentArrangementDocumentService.AddDocument(document);
//            }
//        }

//        public Task<int?> GetCustomApproverRole(IWizardContext context)
//        {
//            var wizard = context.Deserialize<Wizard>(context.Data);
//            var stepData = context.Deserialize<ArrayList>(wizard.Data);
//            var qualifyResult = context.Deserialize<QualifyResult>(stepData[0].ToString());

//            if (qualifyResult.PaymentFrequency == PaymentFrequencyEnum.Monthly)
//            {
//                if ((qualifyResult.Amount / qualifyResult.MaxNumberMonthsAllowed) <= 20000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / qualifyResult.MaxNumberMonthsAllowed) > 20000 && (qualifyResult.Amount / qualifyResult.MaxNumberMonthsAllowed) <= 200000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / qualifyResult.MaxNumberMonthsAllowed) > 200000 && (qualifyResult.Amount / qualifyResult.MaxNumberMonthsAllowed) <= 1000000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / qualifyResult.MaxNumberMonthsAllowed) > 1000000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//            }

//            if (qualifyResult.PaymentFrequency == PaymentFrequencyEnum.Quarterly)
//            {
//                if ((qualifyResult.Amount / 4) <= 20000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / 4) > 20000 && (qualifyResult.Amount / 4) <= 200000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / 4) > 200000 && (qualifyResult.Amount / 4) <= 1000000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / 4) > 1000000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//            }

//            if (qualifyResult.PaymentFrequency == PaymentFrequencyEnum.BiAnnually)
//            {
//                if ((qualifyResult.Amount / 2) <= 20000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / 2) > 20000 && (qualifyResult.Amount / 2) <= 200000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / 2) > 200000 && (qualifyResult.Amount / 2) <= 1000000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//                if ((qualifyResult.Amount / 2) > 1000000)
//                {
//                    return Task.FromResult<int?>(1);
//                }
//            }

//            return Task.FromResult<int?>(1);
//        }
//    }
//}
