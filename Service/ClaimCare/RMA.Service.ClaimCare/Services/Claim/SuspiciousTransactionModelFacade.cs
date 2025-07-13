using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Entities;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Common.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;

using Serilog;

using System;
using System.Fabric;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

using static RMA.Service.Integrations.Contracts.Entities.CompCare.SuspiciousTransactionRequest;
using static RMA.Service.Integrations.Contracts.Entities.CompCare.SuspiciousTransactionResponse;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class SuspiciousTransactionModelFacade : RemotingStatelessService, ISuspiciousTransactionModelService
    {

        private readonly IConfigurationService _configuration;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IUserReminderService _userReminderService;
        private readonly IHttpClientService _httpClientService;
        private static string ExceptionFriendlyMessage = "There was an error connecting to STM, please try again in a few minutes.";
        private static string InvalidRequestFriendlyMessage = "Request is invalid.";
        private int retryCount = 0;
        private bool failed = true;

        public SuspiciousTransactionModelFacade(
             StatelessServiceContext context,
             IConfigurationService configuration,
             IDbContextScopeFactory dbContextScopeFactory,
             IUserReminderService userReminderService,
             IHttpClientService httpClientService
             ) : base(context)
        {
            _configuration = configuration;
            _dbContextScopeFactory = dbContextScopeFactory;
            _userReminderService = userReminderService;
            _httpClientService = httpClientService;
        }

        public async Task<RootSuspiciousTransactionResponse> SendSTMRequest(RootSuspiciousTransactionRequest request, PersonEvent personEvent)
        {
            var SuspiciousTransactionsAPI = await _configuration.GetModuleSetting(SystemSettings.SuspiciousTransactionsAPI);
            var SuspiciousTransactionsSubscriptionKey = await _configuration.GetModuleSetting(SystemSettings.SuspiciousTransactionsSubscriptionKey);
            var SuspiciousTransactionAuthorization = await _configuration.GetModuleSetting(SystemSettings.SuspiciousTransactionAuthorization);
            var SuspiciousTransactionApiWorkspaces = await _configuration.GetModuleSetting(SystemSettings.SuspiciousTransactionApiWorkspaces);
            var SuspiciousTransactionApiServices = await _configuration.GetModuleSetting(SystemSettings.SuspiciousTransactionApiServices);
            var SuspiciousTransactionApiVersion = await _configuration.GetModuleSetting(SystemSettings.SuspiciousTransactionApiVersion);
            _ = new RootSuspiciousTransactionResponse();

            try
            {
                HttpClientSettings httpClientSettings = new HttpClientSettings() { BaseAddress = new Uri(SuspiciousTransactionsAPI) };
                httpClientSettings.AddDefaultRequestHeaderAccept("application/json");
                httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", SuspiciousTransactionsSubscriptionKey);
                httpClientSettings.AddDefaultRequestHeader("Authorization", "Bearer " + SuspiciousTransactionAuthorization);

                var uri = $"{httpClientSettings.BaseAddress}/workspaces/{SuspiciousTransactionApiWorkspaces}/services/{SuspiciousTransactionApiServices}/execute?api-version={SuspiciousTransactionApiVersion}&details=true";
                var claimRequest = JsonConvert.SerializeObject(request);

                HttpResponseMessage response;
                byte[] byteData = Encoding.UTF8.GetBytes(claimRequest);

                using (var content = new ByteArrayContent(byteData))
                {
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    response = await _httpClientService.PostAsync(httpClientSettings, uri, content);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseString = await response.Content.ReadAsStringAsync();
                        return JsonConvert.DeserializeObject<RootSuspiciousTransactionResponse>(responseString);
                    }
                    else
                    {
                        var rootSuspiciousTransactionResponse = new RootSuspiciousTransactionResponse();
                        var message = $"STM Request failed with status code: {response.StatusCode}, Response: {response.ReasonPhrase}";
                        if (string.IsNullOrEmpty(personEvent.CompCarePevRefNumber))
                        {
                            var userReminder = new UserReminder
                            {
                                ItemId = personEvent.PersonEventId,
                                UserReminderType = UserReminderTypeEnum.SystemNotification,
                                AssignedToUserId = RmaIdentity.UserId,
                                Text = message
                            };
                            await _userReminderService.CreateUserReminder(userReminder);
                        }
                        return rootSuspiciousTransactionResponse;
                    }
                }

            }
            catch (Exception ex)
            {

                Log.Logger.Error(ex, "Suspicious Transaction Request Error");
                var rootSuspiciousTransactionResponse = new RootSuspiciousTransactionResponse();
                retryCount++;
                failed = true;
                return rootSuspiciousTransactionResponse;
            }
        }
    }
}