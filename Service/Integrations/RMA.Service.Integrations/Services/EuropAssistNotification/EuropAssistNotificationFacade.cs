using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities;
using RMA.Service.Integrations.Contracts.Interfaces.EuropAssistNotification;

using System;
using System.Fabric;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Services.EuropAssistNotification
{
    public class EuropAssistNotificationFacade : RemotingStatelessService, IEuropAssistNotificationService
    {
        private readonly IConfigurationService _configuration;
        private readonly IHttpClientService _httpClientService;

        public EuropAssistNotificationFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _configuration = configuration;
            _httpClientService = httpClientService;
        }

        public async Task<string> SendClaimRegistration(EuropAssistClaimDetails notification)
        {
            var emailUrl = await _configuration.GetModuleSetting(SystemSettings.EmailApiUrl);
            var emailSubscriptionKey = await _configuration.GetModuleSetting(SystemSettings.EmailOcpApimSubscriptionKey);

            HttpClientSettings httpClientSettings = new HttpClientSettings() { BaseAddress = new Uri(emailUrl) };
            httpClientSettings.AddDefaultRequestHeaderAccept("application/json");
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", emailSubscriptionKey);

            var uri = $"{httpClientSettings.BaseAddress}";
            var emailRequest = JsonConvert.SerializeObject(notification);

            HttpResponseMessage response;
            byte[] byteData = Encoding.UTF8.GetBytes(emailRequest);
            using (var content = new ByteArrayContent(byteData))
            {
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                response = await _httpClientService.PostAsync(httpClientSettings, uri, content);
            }

            EmailNotificationResponse result = JsonConvert.DeserializeObject<EmailNotificationResponse>(await response.Content.ReadAsStringAsync());

            return await Task.FromResult(result.StatusCode);
        }
    }
}
