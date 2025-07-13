using Newtonsoft.Json;

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
    public class MedicalReportFacade : RemotingStatelessService, IMedicalReportService
    {
        private readonly IConfigurationService _configuration;
        private readonly IHttpClientService _httpClientService;
        private const string SubmitMedicalReport = "SubmitCompCareMedicalReport";
        private readonly IIntegrationLoggingService _integrationLoggingService;

        private enum CompcareMedicalReportType
        {
            First = 1,
            Progress = 2,
            Final = 3
        }

        public MedicalReportFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IIntegrationLoggingService integrationLoggingService,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _configuration = configuration;
            _integrationLoggingService = integrationLoggingService;
            _httpClientService = httpClientService;
        }

        public async Task<RootMedicalReportSubmissionResponse> SubmitCompCareMedicalReport(RootMedicalReportSubmissionRequest rootMedicalReportSubmissionRequest)
        {
            if (rootMedicalReportSubmissionRequest == null) return null;

            mapToCompcareReportTypes(rootMedicalReportSubmissionRequest);

            var isLoggingRequired = await _configuration.GetModuleSetting(SystemSettings.IsSubmitCompCareMedicalReportIntegrationLoggingRequired);
            if (Convert.ToBoolean(isLoggingRequired))
                await LogIntergrationRequest(rootMedicalReportSubmissionRequest.request);

            var apiUrl = await _configuration.GetModuleSetting(SystemSettings.CCMedicalReportAPIUrl);
            var apiSubscriptionKey = await _configuration.GetModuleSetting(SystemSettings.CCMedicalReportOcpApimSubscriptionKey);

            try
            {
                HttpClientSettings httpClientSettings = new HttpClientSettings() { BaseAddress = new Uri(apiUrl) };
                httpClientSettings.AddDefaultRequestHeaderAccept("application/json");
                httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", apiSubscriptionKey);

                var uri = $"{httpClientSettings.BaseAddress}";

                var apiRequest = JsonConvert.SerializeObject(rootMedicalReportSubmissionRequest);

                byte[] rawApiRequest = Encoding.UTF8.GetBytes(apiRequest);

                using (var content = new ByteArrayContent(rawApiRequest))
                {
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

                    Log.Logger.Warning($"SubmitCompCareMedicalReport {rootMedicalReportSubmissionRequest.request.sourceSystemReference} before send");
                    var httpApiResponse = await _httpClientService.PostAsync(httpClientSettings, uri, content);
                    Log.Logger.Warning($"SubmitCompCareMedicalReport {rootMedicalReportSubmissionRequest.request.sourceSystemReference} after send");

                    var jsonApiResponse = await httpApiResponse.Content.ReadAsStringAsync();

                    var apiResponse = JsonConvert.DeserializeObject<RootMedicalReportSubmissionResponse>(jsonApiResponse);

                    if (Convert.ToBoolean(isLoggingRequired))
                        await LogIntergrationResponse(apiResponse.response);

                    return apiResponse;
                }
            }
            catch (Exception ex)
            {
                Log.Logger.Error(ex, "Digi SubmitCompCareMedicalReport Error");
                throw;
            }
        }

        private static void mapToCompcareReportTypes(RootMedicalReportSubmissionRequest rootMedicalReportSubmissionRequest)
        {
            switch (rootMedicalReportSubmissionRequest.request.medicalReportTypeId)
            {
                case 4:
                    rootMedicalReportSubmissionRequest.request.medicalReportTypeId = (int)CompcareMedicalReportType.First;
                    break;
                case 5:
                    rootMedicalReportSubmissionRequest.request.medicalReportTypeId = (int)CompcareMedicalReportType.Progress;
                    break;
                case 6:
                    rootMedicalReportSubmissionRequest.request.medicalReportTypeId = (int)CompcareMedicalReportType.Final;
                    break;
            }
        }

        private async Task LogIntergrationRequest(MedicalReportSubmissionRequest medicalReportSubmissionRequest)
        {
            var integrationLogging = new IntegrationLogging();
            integrationLogging.CreatedBy = medicalReportSubmissionRequest.lastChangedBy;
            integrationLogging.ModifiedBy = medicalReportSubmissionRequest.lastChangedBy;
            integrationLogging.CreatedDate = DateTimeHelper.SaNow;
            integrationLogging.ModifiedDate = DateTimeHelper.SaNow;
            integrationLogging.IntegrationName = SubmitMedicalReport;
            integrationLogging.SerializedPayload = medicalReportSubmissionRequest.ToJson();
            integrationLogging.IsRequest = true;

            await _integrationLoggingService.AddIntegrationLogging(integrationLogging);
        }

        private async Task LogIntergrationResponse(MedicalReportSubmissionResponse medicalReportSubmissionResponse)
        {
            var integrationLogging = new IntegrationLogging();
            integrationLogging.CreatedBy = RmaIdentity.Username;
            integrationLogging.ModifiedBy = RmaIdentity.Username;
            integrationLogging.CreatedDate = DateTimeHelper.SaNow;
            integrationLogging.ModifiedDate = DateTimeHelper.SaNow;
            integrationLogging.IntegrationName = SubmitMedicalReport;
            integrationLogging.SerializedPayload = medicalReportSubmissionResponse.ToJson();
            integrationLogging.IsRequest = false;

            await _integrationLoggingService.AddIntegrationLogging(integrationLogging);
        }
    }
}
