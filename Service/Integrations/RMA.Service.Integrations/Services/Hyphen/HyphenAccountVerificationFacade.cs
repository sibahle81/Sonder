using Microsoft.Graph.Models;
using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities.Hyphen;
using RMA.Service.Integrations.Contracts.Interfaces.Hyphen;

using System.Fabric;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace RMA.Service.Integrations.Services.Hyphen
{
    public class HyphenAccountVerificationFacade : RemotingStatelessService, IHyphenAccountVerificationService
    {
        private readonly string _subscriptionKey;
        private readonly string _serviceEndpoint;
        private readonly IHttpClientService _httpClientService;

        public HyphenAccountVerificationFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _serviceEndpoint = configuration?.GetModuleSetting(SystemSettings.HyphenAccountVerificationUrl).Result;
            _subscriptionKey = configuration?.GetModuleSetting(SystemSettings.HyphenAccountVerificationSubscriptionKey).Result;
            _httpClientService = httpClientService;
        }

        public async Task<RootHyphenVerificationResult> VerifyAccount(string accountNo, BankAccountTypeEnum accountType, string branchCode, string initials, string lastName, string idNumber)
        {
            string payload=string.Empty;
            if (idNumber != null)
            {
                payload = GenerateJson(accountNo, accountType, branchCode, initials, lastName, idNumber);
            }
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            // Request headers
            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", _subscriptionKey);

            var uri = _serviceEndpoint + queryString;

            // Request body
            var byteData = Encoding.UTF8.GetBytes(s: payload);

            using (var content = new ByteArrayContent(byteData))
            {
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var responseMsg = await _httpClientService.PostAsync(httpClientSettings, uri, content);
                if (responseMsg.IsSuccessStatusCode)
                {
                    var responseString = await responseMsg.Content.ReadAsStringAsync();
                    var verificationResult = JsonConvert.DeserializeObject<RootHyphenVerificationResult>(responseString);
                    verificationResult.success = verificationResult.response != null && (verificationResult.response.messageCode == "00001" ||
                        verificationResult.response.messageCode == "00000");
                    return verificationResult;
                }
                else
                {
                    throw new System.Exception($"Error {(int)responseMsg.StatusCode}: {responseMsg.ReasonPhrase}");
                }
            }
        }

        private string GenerateJson(string accountNo, BankAccountTypeEnum accountType, string branchCode, string initials, string lastName, string idNumber)
        {
            var payload = new HyphenVerificationRequest()
            {
                accountNumber = accountNo,
                accountType = "0" + ConvertToHyphenBankAccount(accountType),
                branchCode = branchCode,
                emailAddress = string.Empty,
                idNumber = idNumber?.Replace(@"\", "").Replace("/", ""),
                initials = initials,
                lastName = lastName,
                @operator = string.Empty,
                phoneNumber = string.Empty,
                userReference = "yyyyMMddHHmmssfff"
            };

            return payload.ToJson();
        }

        private static int ConvertToHyphenBankAccount(BankAccountTypeEnum? bankAccountType)
        {

            switch (bankAccountType)
            {
                case BankAccountTypeEnum.CurrentAccount:
                case BankAccountTypeEnum.ChequeAccount:
                    return (int)HyphenBankAccountTypeEnum.Cheque;
                case BankAccountTypeEnum.SavingsAccount:
                    return (int)HyphenBankAccountTypeEnum.Savings;
                case BankAccountTypeEnum.TransmissionAccount:
                    return (int)HyphenBankAccountTypeEnum.Transmission;
                case BankAccountTypeEnum.BondAccount:
                    return (int)HyphenBankAccountTypeEnum.Bond;
                default:
                    return 0;
            }
        }

    }
}
