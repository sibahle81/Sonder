using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities.Vopd;
using RMA.Service.Integrations.Contracts.Interfaces.Vopd;

using System;
using System.Fabric;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace RMA.Service.Integrations.Services.Vopd
{
    public class VopdRequestProcessorFacade : RemotingStatelessService, IVopdRequestProcessorService
    {
        private readonly IUserService _userService;
        private readonly IConfigurationService _configuration;
        private readonly IHttpClientService _httpClientService;

        public VopdRequestProcessorFacade(
            StatelessServiceContext serviceContext,
            IUserService userService,
            IConfigurationService configuration,
            IHttpClientService httpClientService
            ) : base(serviceContext)
        {
            _userService = userService;
            _configuration = configuration;
            _httpClientService = httpClientService;
        }

        public async Task<VopdResponse> ReceiveMessageAsync(VopdRequestMessage message, CancellationToken cancellationToken)
        {
            var vopdResponse = new VopdResponse
            {
                DateVerified = DateTime.Now,
                Reason = "Message not Valid"
            };

            if (message != null)
            {
                await ImpersonateUser(message.ImpersonateUser);

                // Getting all the needed Variables
                var verificationType = message.VerificationType.DisplayAttributeValue().ToLower();
                var baseUrl = await _configuration.GetModuleSetting(SystemSettings.HomeAffairsVerificationV2BaseUrl);
                var subscriptionKey = await _configuration.GetModuleSetting(SystemSettings.HomeAffairsSubcriptionKey);
                var headerTitle = await _configuration.GetModuleSetting(SystemSettings.HomeAffairsVerificationRequestHeaderKey);

                var queryString = HttpUtility.ParseQueryString($"{verificationType}-verification");

                // Request headers
                HttpClientSettings httpClientSettings = new HttpClientSettings();
                httpClientSettings.AddDefaultRequestHeader(headerTitle, subscriptionKey);

                var uri = baseUrl + queryString;

                // This is the class that gets instantiated if it's a Status verification 
                var root = new RootHomeAffairsStatusVerificationRequest()
                {
                    HomeAffairsStatusVerification = new HomeAffairsStatusVerification() { idReferenceNo = message.IdReferenceNo }
                };

                var bodyToJson = JsonConvert.SerializeObject(root);

                // Request body
                var byteData = Encoding.UTF8.GetBytes(bodyToJson);

                using (var content = new ByteArrayContent(byteData))
                {
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

                    var response = await _httpClientService.PostAsync(httpClientSettings, uri, content, cancellationToken);

                    vopdResponse.RolePlayerId = message.RolePlayerId;
                    vopdResponse.IdNumber = message.IdNumber;
                    vopdResponse.VopdStatus = VopdStatusEnum.SentToAstute;
                    vopdResponse.Reason = response.ReasonPhrase;
                }
            }
            return vopdResponse;
        }


        protected async Task ImpersonateUser(string username)
        {
            try
            {
                // This process should not affect message processing
                var userInfo = await _userService.GetUserImpersonationInfo(username);
                userInfo.SetRemotingContext();
            }
            catch (TechnicalException ex)
            {
                ex.LogException();
            }
        }

    }
}
