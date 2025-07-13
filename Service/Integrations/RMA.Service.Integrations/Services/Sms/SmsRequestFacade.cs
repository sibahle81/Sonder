using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Interfaces.Sms;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Services.Sms
{
    public class SmsRequestFacade : RemotingStatelessService, ISmsRequestService
    {
        private readonly IConfigurationService _configuration;
        private readonly IHttpClientService _httpClientService;

        public SmsRequestFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _configuration = configuration;
            _httpClientService = httpClientService;
        }

        private async Task<SMSResponse> SendSms(string campaign, string department, string username, string number, string message)
        {
            var smsResponse = new SMSResponse();

            if (!ValidateCellPhoneNumber(number)) return smsResponse;

            var smsApiUrl = await _configuration.GetModuleSetting(SystemSettings.SMSApiUrl);
            var smsSubscriptionKey = await _configuration.GetModuleSetting(SystemSettings.SMSOcpApimSubscriptionKey);
            var allowExternalCommunication = (await _configuration.GetModuleSetting(SystemSettings.AllowExternalCommunication)).ToBoolean(true);

            if (!allowExternalCommunication)
            {
                number = await _configuration.GetModuleSetting(SystemSettings.InternalCommunicationSmsNumber);
            }

            number = number.Replace(" ", string.Empty);
            number = PrefixRSACode(number);

            HttpClientSettings httpClientSettings = new HttpClientSettings() { BaseAddress = new Uri(smsApiUrl) };
            httpClientSettings.AddDefaultRequestHeaderAccept("application/json");
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", smsSubscriptionKey);

            var uri = $"{httpClientSettings.BaseAddress}";
            campaign = $"MOD|{campaign}";
            var smsRequest = JsonConvert.SerializeObject(new { number, message, campaign, department, username });

            HttpResponseMessage response;
            byte[] byteData = Encoding.UTF8.GetBytes(smsRequest);
            using (var content = new ByteArrayContent(byteData))
            {
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                response = await _httpClientService.PostAsync(httpClientSettings, uri, content);
            }

            await CheckRequestSuccess(response);

            var responseString = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<SMSResponse>(responseString);
        }

        private static async Task CheckRequestSuccess(HttpResponseMessage response)
        {
            if (!response.IsSuccessStatusCode)
            {
                var exception = await response.Content.ReadAsStringAsync();
                throw new Exception(exception);
            }
        }

        private string PrefixRSACode(string number)
        {
            return "0027" + number.Substring(1);
        }

        private static bool ValidateCellPhoneNumber(string number)
        {
            return number.Length >= 10;
        }

        public async Task<List<SendSmsRequestResult>> SendSmsMessage(SendSmsRequest request)
        {
            List<SendSmsRequestResult> sendSmsRequestResults = new List<SendSmsRequestResult>();
            if (request?.SmsNumbers?.Count > 0)
            {
                var userName = RmaIdentity.Username;
                if (userName.Contains('@'))
                {
                    userName = userName.Split('@')[0];
                }

                foreach (var sms in request.SmsNumbers)
                {
                    short retryCount = 3;
                    bool sent = false;

                    while (!sent && retryCount > 0)
                    {
                        try
                        {
                            var res = await SendSms(request.Campaign, request.Department.DisplayAttributeValue(), userName, sms, request.Message);
                            sendSmsRequestResults.Add(new SendSmsRequestResult { IsSuccess = true, ProcessDescription = null, SmsNumber = sms, SmsReference = res.Messages.FirstOrDefault()?.Reference });
                            sent = true;
                        }
                        catch (Exception ex)
                        {
                            retryCount--;
                            if (retryCount == 0)
                            {
                                ex.LogException("", request, sms);
                                sendSmsRequestResults.Add(new SendSmsRequestResult { IsSuccess = false, ProcessDescription = ex.Message, SmsNumber = sms });
                            }
                        }
                    }
                }
            }
            return sendSmsRequestResults;
        }
    }

    class SMSResponse
    {
        public string Details { get; set; }
        public int ErrorCode { get; set; }
        public List<Message> Messages { get; set; }
    }

    class Message
    {
        public string To { get; set; }
        public string Status { get; set; }
        public string Reference { get; set; }
        public int Parts { get; set; }
        public string MessageDetails { get; set; }
        public int MessageErrorCode { get; set; }
    }
}
