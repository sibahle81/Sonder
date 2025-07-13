using Newtonsoft.Json;
using RMA.Common.Constants;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Enums;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ScanCare.Contracts.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Net.Http;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Forms;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PolicyReportFacade : RemotingStatelessService, IPolicyReportService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IConfigurationService _configurationService;
        private readonly ISendEmailService _sendEmailService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IHttpClientService _httpClientService;

        private readonly IRepository<policy_Policy> _policyRepository;

        private const string OcpApimSubscriptionKeyHeader = "Ocp-Apim-Subscription-Key";

        public PolicyReportFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IConfigurationService configurationService,
            ISendEmailService sendEmailService,
            IDocumentIndexService documentIndexService,
            IRepository<policy_Policy> policyRepository,
            IHttpClientService httpClientService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _configurationService = configurationService;
            _sendEmailService = sendEmailService;
            _documentIndexService = documentIndexService;
            _policyRepository = policyRepository;
            _httpClientService = httpClientService;
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        public async Task<bool> SendCorporatePaymentFiles()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var company = "";
                try
                {
                    var cutoffDate = DateTime.Today;
                    // Get the stop order files due
                    var stopOrders = await _policyRepository
                       .SqlQueryAsync<CompanyStopOrder>(
                           DatabaseConstants.GetStopOrdersDueByDate,
                           new SqlParameter { ParameterName = "@date", Value = cutoffDate }
                       );
                    // Do nothing if no files are due
                    if (stopOrders.Count == 0) { return true; }
                    // Send the stop order files
                    foreach (var stopOrder in stopOrders)
                    {
                        // Set the company for the exception
                        company = stopOrder.CompanyCode;
                        // Send the policy details
                        switch (stopOrder.StopOrderExportType)
                        {
                            case StopOrderExportTypeEnum.SSRSReport:
                                await EmailStopOrderPaymentReport(stopOrder);
                                break;
                            case StopOrderExportTypeEnum.SBPMCSVFile:
                                await SendStopOrderPaymentFile(stopOrder, stopOrder.SalaryMonth);
                                break;
                        }
                    }
                    return true;
                }
                catch (Exception ex)
                {
                    ex.LogException($"{company} Corporate Stop Order File Error");
                    throw;
                }
            }
        }

        private async Task SendStopOrderPaymentFile(CompanyStopOrder stopOrder, DateTime salaryDate)
        {
            Contract.Requires( stopOrder != null );
            var policies = await _policyRepository
               .SqlQueryAsync<CompanyStopOrderDetail>(
                   DatabaseConstants.GetCompanyStopOrderPaymentFile,
                   new SqlParameter { ParameterName = "@employerCode", Value = stopOrder.CompanyCode },
                   new SqlParameter { ParameterName = "@salaryDate", Value = salaryDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) }
               );

            if (policies.Count == 0) { return; }
            if (policies.Count > 0 && string.IsNullOrEmpty(policies[0].PolicyNumber)) { return; }

            var documents = new List<Document>();

            // Get the file content
            var fileContent = $"Company Name:,{stopOrder.CompanyName}\r\n"
                + $"Month:,{salaryDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}\r\n\r\n"
                + "Employee Number,ID Number,Surname & Initials,Policy Number,Policy Status,Premium Amount,Policy Inception Date\r\n";
            foreach (var policy in policies)
            {
                fileContent += $"{policy.PersalNumber},"
                    + $"{policy.IdNumber},"
                    + $"{policy.MemberName},"
                    + $"{policy.PolicyNumber},"
                    + $"{policy.PolicyStatus},"
                    + $"{policy.Premium.Value.ToString("0.00", CultureInfo.InvariantCulture)},"
                    + $"{policy.InceptionDate.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}\r\n";
                // Check if there is a policy stop order mandate form for the policy
                var keys = new Dictionary<string, string>();
                keys.Add("Policy", $"{policy.PolicyId}");
                keys.Add("CaseCode", policy.PolicyNumber.Replace('X', '-'));
                var document = await _documentIndexService
                    .GetDocumentByKeyValueDocTypeId(
                        keys,
                        DocumentTypeEnum.CollectionMandate
                    );
                if (document != null)
                {
                    document.FileName = $"{policy.PolicyNumber}_{document.FileName}";
                    documents.Add(document);
                }
            }
            // Upload to document server
            var uploadedDocument = await _documentIndexService.UploadDocument(GetStopOrderDocument(stopOrder, fileContent));
            // Call integration API with the relevant file details
            documents.Insert(0, uploadedDocument);
            await SendStopOrderPaymentFiles(stopOrder.Recipient, documents);
        }

        private async Task SendStopOrderPaymentFiles(string recipient, List<Document> documents)
        {
            if (string.IsNullOrEmpty(recipient))
            {
                throw new Exception("The API URL for the stop order file has not been defined.");
            }

            var cfpSubscriptionKey = await _configurationService.GetModuleSetting(SystemSettings.CfpOcpApimSubscriptionKey);

            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader(OcpApimSubscriptionKeyHeader, cfpSubscriptionKey);

            var payload = GetPayload(documents);
            using (var content = new StringContent(payload, Encoding.UTF8, "application/json"))
            {
                HttpResponseMessage response = await _httpClientService.PostAsync(httpClientSettings, recipient, content);
                if (!response.IsSuccessStatusCode)
                {
                    string errorResponse = await response.Content.ReadAsStringAsync();
                    throw new Exception($"{response.StatusCode} {errorResponse}");
                }
            }
        }

        private string GetPayload(List<Document> documents)
        {
            var payload = new
            {
                Files = documents.Select(
                    s => new
                    {
                        Uri = s.DocumentUri,
                        s.FileName,
                        FileType = s.DocTypeId == (int)DocumentTypeEnum.StopOrderPaymentFile
                            ? "Collection"
                            : "Mandate"
                    }
                )
            };
            var json = JsonConvert.SerializeObject(payload);
            return json;
        }

        private Document GetStopOrderDocument(CompanyStopOrder stopOrder, string fileContent)
        {
            Contract.Requires(stopOrder != null );
            var fileName = $"{stopOrder.CompanyCode}{stopOrder.SalaryMonth.ToString("MMMMyyyy", CultureInfo.InvariantCulture)}.csv";
            var document = new Document
            {
                DocTypeId = (int)DocumentTypeEnum.StopOrderPaymentFile,
                SystemName = "Top50",
                FileName = fileName,
                Keys = new Dictionary<string, string> { { "Payment", stopOrder.CompanyCode } },
                DocumentStatus = DocumentStatusEnum.Received,
                FileExtension = "text/csv",
                FileAsBase64 = ConvertStringToBase64(fileContent),
                MimeType = MimeMapping.GetMimeMapping(fileName)
            };
            return document;
        }

        private string ConvertStringToBase64(string content)
        {
            byte[] fileBytes = Encoding.UTF8.GetBytes(content);
            return Convert.ToBase64String(fileBytes);
        }

        private async Task EmailStopOrderPaymentReport(CompanyStopOrder stopOrder)
        {
            Contract.Requires(stopOrder != null);
            // Get the report properties
            var ssrsUrl = await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl);
            ssrsUrl += "RMA.Reports.ClientCare.Policy/";
            // Get the file and mail it
            if (!string.IsNullOrEmpty(stopOrder.Recipient))
            {
                var attachments = new List<MailAttachment>();
                var parameters = $"&employerCode={stopOrder.CompanyCode}"
                    + $"&salaryDate={stopOrder.SalaryMonth.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}"
                    + $"&rs:Format=EXCELOPENXML"
                    + "&rs:Command=ClearSession";
                var uri = new Uri($"{ssrsUrl}{stopOrder.Report}{parameters}");
                var stopOrderFile = await GetUriDocumentByteData(uri);
                if (stopOrderFile?.Length > 0)
                {
                    var fileName = $"{stopOrder.CompanyCode},RMA{stopOrder.SalaryMonth.ToString("MMMMyyyy", CultureInfo.InvariantCulture)}.xlsx";
                    attachments.Add(
                        new MailAttachment
                        {
                            AttachmentByteData = stopOrderFile,
                            FileName = fileName,
                            FileType = "application/vnd.ms-excel"
                        }
                    );

                    var body = await _configurationService.GetModuleSetting(SystemSettings.StopOrderPaymentFileEmailBody);
                    body = body.Replace("{0}", $"{stopOrder.CompanyCode} {stopOrder.CompanyName}");
                    var request = new SendMailRequest
                    {
                        ItemType = ItemTypeEnum.StopOrderCompany.DisplayAttributeValue(),
                        ItemId = stopOrder.CompanyStopOrderId,
                        Department = RMADepartmentEnum.LifeOperations,
                        BusinessArea = BusinessAreaEnum.StopOrderPaymentFiles,
                        FromAddress = "noreply@randmutual.co.za",
                        Recipients = stopOrder.Recipient,
                        Subject = $"{stopOrder.CompanyCode} {stopOrder.SalaryMonth.ToString("MMMM yyyy", CultureInfo.InvariantCulture)} Stop Order Payment File",
                        Body = body,
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    };
                    await _sendEmailService.SendEmail(request);
                }
            }
        }

    }
}
