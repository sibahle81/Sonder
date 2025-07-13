using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.DigiCare.Contracts.Entities.Digi;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;
using RMA.Service.Integrations.Contracts.Entities.CompCare;
using RMA.Service.Integrations.Contracts.Interfaces.CompCare;

using Serilog;

using System;
using System.Fabric;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Services.CompCare
{
    public class CCClaimFacade : RemotingStatelessService, ICCClaimService
    {
        private readonly IConfigurationService _configuration;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IIntegrationLoggingService _integrationLoggingService;
        private readonly IHttpClientService _httpClientService;
        private static string ExceptionFriendlyMessage = "There was an error connecting to Compcare, please try again in a few minutes.";
        private static string InvalidRequestFriendlyMessage = "Request is invalid.";


        public CCClaimFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IIntegrationLoggingService integrationLoggingService,
            IDbContextScopeFactory dbContextScopeFactory,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _configuration = configuration;
            _dbContextScopeFactory = dbContextScopeFactory;
            _integrationLoggingService = integrationLoggingService;
            _httpClientService = httpClientService;
        }

        public async Task<RootCCClaimResponse> SendClaimRequest(RootCCClaimRequest request)
        {
            var CCClaimsAPIUrl = await _configuration.GetModuleSetting(SystemSettings.CCClaimsAPIUrl);
            var CCClaimsOcpApimSubscriptionKey = await _configuration.GetModuleSetting(SystemSettings.CCClaimsOcpApimSubscriptionKey);

            var isLoggingRequired = await _configuration.GetModuleSetting(SystemSettings.IsClaimSearchIntegrationLoggingRequired);

            if (request == null || request.request == null || string.IsNullOrWhiteSpace(request.request.claimReferenceNo))
            {
                var rootCCClaimResponse = new RootCCClaimResponse();
                rootCCClaimResponse.response = new CCClaimResponse();
                rootCCClaimResponse.response.message = InvalidRequestFriendlyMessage;
                return rootCCClaimResponse;
            }

            request.request.claimReferenceNo = request.request.claimReferenceNo.Trim();

            if (Convert.ToBoolean(isLoggingRequired))
            {
                var integrationLogging = GetIntegrationLogging(true, "ClaimSearch");
                integrationLogging.SerializedPayload = JsonConvert.SerializeObject(request);
                await _integrationLoggingService.AddIntegrationLogging(integrationLogging);
            }
            try
            {
                HttpClientSettings httpClientSettings = new HttpClientSettings() { BaseAddress = new Uri(CCClaimsAPIUrl) };
                httpClientSettings.AddDefaultRequestHeaderAccept("application/json");
                httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", CCClaimsOcpApimSubscriptionKey);

                var uri = $"{httpClientSettings.BaseAddress}";

                var claimRequest = JsonConvert.SerializeObject(request);
                byte[] byteData = Encoding.UTF8.GetBytes(claimRequest);

                using (var content = new ByteArrayContent(byteData))
                {
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    Log.Logger.Warning($"SendClaimRequest {request.request.sourceSystemReference} before send");
                    var responseClaim = await _httpClientService.PostAsync(httpClientSettings, uri, content);
                    Log.Logger.Warning($"SendClaimRequest {request.request.sourceSystemReference} after send");

                    var responseString = await responseClaim.Content.ReadAsStringAsync();

                    if (Convert.ToBoolean(isLoggingRequired))
                    {
                        var integrationLogging = GetIntegrationLogging(false, "ClaimSearch");
                        integrationLogging.SerializedPayload = responseString;
                        await _integrationLoggingService.AddIntegrationLogging(integrationLogging);
                    }

                    return JsonConvert.DeserializeObject<RootCCClaimResponse>(responseString);
                }
            }
            catch (Exception ex)
            {
                Log.Logger.Error(ex, "Digi SendClaimRequest Error");
                var rootCCClaimResponse = new RootCCClaimResponse();
                rootCCClaimResponse.response = new CCClaimResponse();
                rootCCClaimResponse.response.message = ExceptionFriendlyMessage;
                return rootCCClaimResponse;
            }
        }

        public async Task<RootMedicalReportCategory> GetMedicalReportCategories()
        {
            //https://apiqa.randmutual.co.za/masterdata/v1/medical-report-categories API endpoint
            var ReportCategoriesAPIUrl = await _configuration.GetModuleSetting(SystemSettings.ReportCategoriesAPIUrl);
            var ReportCategoriesOcpApimSubscriptionKey = await _configuration.GetModuleSetting(SystemSettings.CCClaimsOcpApimSubscriptionKey);

            HttpClientSettings httpClientSettings = new HttpClientSettings() { BaseAddress = new Uri(ReportCategoriesAPIUrl) };
            httpClientSettings.AddDefaultRequestHeaderAccept("application/json");
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", ReportCategoriesOcpApimSubscriptionKey);

            var uri = $"{httpClientSettings.BaseAddress}";

            var responseReportCategories = await _httpClientService.GetAsync(httpClientSettings, uri);
            var responseString = await responseReportCategories.Content.ReadAsStringAsync();

            var isLoggingRequired = await _configuration.GetModuleSetting(SystemSettings.IsMedicalReportCategoriesIntegrationLoggingRequired);
            if (Convert.ToBoolean(isLoggingRequired))
            {
                var integrationLogging = GetIntegrationLogging(false, "GetMedicalReportCategories");
                integrationLogging.SerializedPayload = responseString;
                await _integrationLoggingService.AddIntegrationLogging(integrationLogging);
            }

            return JsonConvert.DeserializeObject<RootMedicalReportCategory>(responseString);
        }

        public async Task<RootMedicalReportType> GetMedicalReportTypes()
        {
            //https://apiqa.randmutual.co.za/masterdata/v1/medical-report-types API endpoint
            var ReportTypesAPIUrl = await _configuration.GetModuleSetting(SystemSettings.ReportTypesAPIUrl);
            var ReportTypesOcpApimSubscriptionKey = await _configuration.GetModuleSetting(SystemSettings.CCClaimsOcpApimSubscriptionKey);

            HttpClientSettings httpClientSettings = new HttpClientSettings() { BaseAddress = new Uri(ReportTypesAPIUrl) };
            httpClientSettings.AddDefaultRequestHeaderAccept("application/json");
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", ReportTypesOcpApimSubscriptionKey);

            var uri = $"{httpClientSettings.BaseAddress}";

            var responseReportTypes = await _httpClientService.GetAsync(httpClientSettings, uri);
            var responseString = await responseReportTypes.Content.ReadAsStringAsync();

            var isLoggingRequired = await _configuration.GetModuleSetting(SystemSettings.IsMedicalReportTypesIntegrationLoggingRequired);
            if (Convert.ToBoolean(isLoggingRequired))
            {
                var integrationLogging = GetIntegrationLogging(false, "GetMedicalReportTypes");
                integrationLogging.SerializedPayload = responseString;
                await _integrationLoggingService.AddIntegrationLogging(integrationLogging);
            }

            return JsonConvert.DeserializeObject<RootMedicalReportType>(responseString);
        }

        public IntegrationLogging GetIntegrationLogging(bool isRequest, string integrationName)
        {
            var integrationLogging = new IntegrationLogging();
            integrationLogging.IsRequest = isRequest;
            integrationLogging.IntegrationName = integrationName;
            integrationLogging.IsDeleted = false;
            integrationLogging.CreatedBy = RmaIdentity.Username;
            integrationLogging.CreatedDate = DateTimeHelper.SaNow;
            integrationLogging.ModifiedBy = RmaIdentity.Username;
            integrationLogging.ModifiedDate = DateTimeHelper.SaNow;

            return integrationLogging;
        }
    }
}
