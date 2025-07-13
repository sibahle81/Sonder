using Newtonsoft.Json;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.Integrations.Contracts.Entities.Vopd;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace RMA.Service.ClientCare.Services.RolePlayer
{
    public class QuickTransactionVopdFacade : RemotingStatelessService, IQuickTransactionVopdService
    {
        private readonly IConfigurationService _configuration;
        private readonly IHttpClientService _httpClientService;
        private int retryCount = 0;
        public QuickTransactionVopdFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _configuration = configuration;
            _httpClientService = httpClientService;
        }

        public async Task<QuickVopdResponseMessage> SubmitVOPDRequest(VopdRequestMessage vopdRequestMessage)
        {
            Contract.Requires(vopdRequestMessage != null);

            var vopdResponseMessage = new QuickVopdResponseMessage();
            try
            {
                var isTransUnionVerification = await _configuration.IsFeatureFlagSettingEnabled("IsTransUnionVerification");
                var verificationType = vopdRequestMessage.VerificationType.DisplayAttributeValue().ToLower();
                var baseUrl = isTransUnionVerification ? await _configuration.GetModuleSetting(SystemSettings.HomeAffairsTransUnionVerificationBaseUrl) : await _configuration.GetModuleSetting(SystemSettings.HomeAffairsVerificationBaseUrl);
                var subscriptionKey = isTransUnionVerification ? await _configuration.GetModuleSetting(SystemSettings.HomeAffairsTransUnionSubcriptionKey) : await _configuration.GetModuleSetting(SystemSettings.HomeAffairsSubcriptionKey);
                var headerTitle = await _configuration.GetModuleSetting(SystemSettings.HomeAffairsVerificationRequestHeaderKey);

                var queryString = HttpUtility.ParseQueryString($"{verificationType}-verification");

                HttpClientSettings httpClientSettings = new HttpClientSettings();
                httpClientSettings.AddDefaultRequestHeader(headerTitle, subscriptionKey);

                var uri = isTransUnionVerification ? baseUrl : baseUrl + queryString;

                var root = new RootHomeAffairsStatusVerificationRequest()
                {
                    HomeAffairsStatusVerification = new HomeAffairsStatusVerification() { idReferenceNo = vopdRequestMessage.IdReferenceNo }
                };

                var bodyToJson = JsonConvert.SerializeObject(root);

                var byteData = Encoding.UTF8.GetBytes(bodyToJson);

                using (var content = new ByteArrayContent(byteData))
                {
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

                    var response = await _httpClientService.PostAsync(httpClientSettings, uri, content);

                    var responseString = await response.Content.ReadAsStringAsync();
                    return vopdResponseMessage = JsonConvert.DeserializeObject<QuickVopdResponseMessage>(responseString);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when submitting VOPD request: {vopdResponseMessage.message} - Error Message {ex.Message}");
                var rootVopdResponseMessage = new QuickVopdResponseMessage();
                retryCount++;
                return rootVopdResponseMessage;
            }
        }
    }
}
