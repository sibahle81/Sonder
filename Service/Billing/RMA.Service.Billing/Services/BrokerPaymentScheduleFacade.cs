using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Net;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services
{
    public class BrokerPaymentScheduleFacade : RemotingStatelessService, IBrokerPaymentScheduleService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly ISendEmailService _emailService;
        private readonly IPolicyNoteService _policyNoteService;
        private readonly IRepository<billing_Invoice> _invoiceRepository;

        private string _fromAddress;
        private string _reportserverUrl;

        private WebHeaderCollection _headerCollection;

        private string _paymentScheduleEmailBody;
        private string _bccAddress;

        public BrokerPaymentScheduleFacade(
           StatelessServiceContext context,
           IDbContextScopeFactory dbContextScopeFactory,
           IConfigurationService configurationService,
           ISendEmailService emailService,
           IPolicyNoteService policyNoteService,
           IRepository<billing_Invoice> invoiceRepository

         ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
            _configurationService = configurationService;
            _emailService = emailService;
            _policyNoteService = policyNoteService;

            Task.Run(() => this.SetupConstantVariables()).Wait();
        }

        private async Task SetupConstantVariables()
        {
            _reportserverUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.ClientCare.Policy";
            _paymentScheduleEmailBody = await _configurationService.GetModuleSetting(SystemSettings.RMAPaymentSchedulePerBrokerReportEmailBody);
            _fromAddress = await _configurationService.GetModuleSetting(SystemSettings.RMAPaymentSchedulePerBrokerReportEmaiFrom);
            _bccAddress = await _configurationService.GetModuleSetting(SystemSettings.RMAPaymentSchedulePerBrokerReportEmaiBcc);

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                {"Authorization", "Bearer " + RmaIdentity.AccessToken},
                {SystemSettings.Environment, environment}
            };
        }

        public async Task<bool> SubmitBrokerPaymentSchedule()
        {
            _ = Task.Run(() => SendBrokerPaymentSchedules());
            return true;
        }

        private async Task<bool> SendBrokerPaymentSchedules()
        {
            try
            {
                List<BrokerPaymentScheduleModel> brokerPaymentScheduleModelList = await GetBrokerSchemePaymentList();
                int progressCounter = 0;

                foreach (var ps in brokerPaymentScheduleModelList)
                {
                    progressCounter++;

                    try
                    {
                        string fileFormat = "EXCEL";

                        if (string.IsNullOrEmpty(ps.SchemeEmailAddress))
                            throw new BusinessException($"Scheme {ps.SchemeName} - {ps.SchemePolicyNumber} email address is blank");

                        var paymentScheduleReport = await GeneratePaymentSchedule(ps, fileFormat);

                        if (paymentScheduleReport.Length < 1) // try PDF
                        {
                            fileFormat = "PDF";
                            paymentScheduleReport = await GeneratePaymentSchedule(ps, fileFormat);
                        }

                        if (paymentScheduleReport.Length < 1)
                        {
                            await NotifyDebtorsTeam(ps, $"Could not generate payment schedule for {ps.SchemeName} - {ps.SchemePolicyNumber}");
                            continue;
                        }

                        var emailBody = _paymentScheduleEmailBody.Replace("{0}", ps.PaymentMonth).Replace("{1}", ps.DebtorNumber);
                        var subject = $"{ps.SchemeName} - {ps.DebtorNumber} - {ps.PaymentMonth}".ToUpper();

                        var attachments = new List<MailAttachment>
                        {
                            new MailAttachment()
                            {
                                AttachmentByteData = paymentScheduleReport,
                                FileName = fileFormat == "EXCEL"? "PaymentSchedule.xls" :"PaymentSchedule.pdf",
                                FileType = fileFormat == "EXCEL"? "application/vnd.ms-excel":"application/pdf",
                            }
                        };

                        //SEND EMAIL TO SCHEME
                        await _emailService.SendEmail(new SendMailRequest
                        {
                            ItemId = ps.PolicyId,
                            ItemType = "Policy",
                            FromAddress = _fromAddress,
                            Recipients = ps.SchemeEmailAddress,
                            RecipientsBCC = _bccAddress,
                            Subject = subject,
                            Body = emailBody,
                            IsHtml = true,
                            Attachments = attachments.ToArray()
                        });

                        var note = new Note()
                        {
                            ItemId = ps.PolicyId,
                            Text = $"Payment Schedule for month [{ps.PaymentMonth}] sent to email address [{ps.SchemeEmailAddress}]"
                        };

                        await _policyNoteService.AddNote(note);

                    }
                    catch (Exception ex)
                    {
                        await NotifyDebtorsTeam(ps, $"SubmitBrokerPaymentSchedule: Error Submitting Payment Schedule for Scheme [{ps.SchemeName}] - Error Message {ex.Message}");
                        ex.LogException($"SubmitBrokerPaymentSchedule: Error Submitting Payment Schedule for Scheme [{ps.SchemeName}] - Error Message {ex.Message}");
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                ex.LogException("Payment Scheduled Task Failure");
                // Do not throw the exception because this is a background task
                return false;
            }
        }

        private async Task NotifyDebtorsTeam(BrokerPaymentScheduleModel ps, string message)
        {
            try
            {
                var subject = $"Error Processing Payment Shedule: {ps.SchemeName} - {ps.DebtorNumber} - {ps.SchemePolicyNumber}".ToUpper();

                // SEND EMAIL TO SCHEME
                await _emailService.SendEmail(new SendMailRequest
                {
                    ItemId = ps.PolicyId,
                    ItemType = "Policy",
                    FromAddress = _fromAddress,
                    Recipients = _bccAddress,
                    Subject = subject,
                    Body = message,
                    IsHtml = true
                });
            }
            catch (Exception ex)
            {
                ex.LogException($"NotifyDebtorsTeam: Error Notifying Debtors Team for Scheme [{ps.SchemeName}] - Error Message {ex.Message}");
            }
        }

        private async Task<List<BrokerPaymentScheduleModel>> GetBrokerSchemePaymentList()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var searchResults = await _invoiceRepository.SqlQueryAsync<BrokerPaymentScheduleModel>(
                              DatabaseConstants.GetMonthlyBrokerPaymentSchedule);

                return searchResults;
            }
        }

        private async Task<byte[]> GeneratePaymentSchedule(BrokerPaymentScheduleModel brokerPaymentSchedule, string fileFormat)
        {
            var counter = 1;
            var parameters = $"&Brokerage={brokerPaymentSchedule.BrokerageId}&Group={brokerPaymentSchedule.SchemeRolePlayerId}&rs:Command=ClearSession";

            var docBytes = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{"RMAPaymentSchedulePerBrokerReport"}{parameters}&rs:Format={fileFormat}"), _headerCollection);

            while (docBytes?.Length == 0 && counter < 3) //3 retries
            {
                docBytes = await GetUriDocumentByteData(new Uri($"{_reportserverUrl}/{"RMAPaymentSchedulePerBrokerReport"}{parameters}&rs:Format={fileFormat}"), _headerCollection);
                counter++;
            }

            return docBytes;
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }
    }
}