using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities.Qlink;
using RMA.Service.Integrations.Contracts.Interfaces.Qlink;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Services.Qlink
{
    public class QlinkIntegrationFacade : RemotingStatelessService, IQlinkIntegrationService
    {
        private readonly IConfigurationService _configuration;
        private readonly IHttpClientService _httpClientService;
        private const string OcpApimSubscriptionKeyHeader = "Ocp-Apim-Subscription-Key";
        public QlinkIntegrationFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _configuration = configuration;
            _httpClientService = httpClientService;
        }

        public async Task<List<QlinkTransactionModel>> SubmitQlinkTransactionRequestAsync(List<QlinkTransactionRequest> qlinkTransactionRequests)
        {
            Contract.Requires(qlinkTransactionRequests != null);
            Contract.Requires(qlinkTransactionRequests.Count > 0);

            var qlinkTransactionApiUrl = await _configuration.GetModuleSetting(SystemSettings.QlinkTransactionApiUrl);
            var qlinkSubscriptionKey = await _configuration.GetModuleSetting(SystemSettings.QlinkOcpApimSubscriptionKey);
            var qlinkTransactionResponses = new List<QlinkTransactionModel>();

            foreach (var qlinkTransactionRequest in qlinkTransactionRequests)
            {
                string payLoad = JsonConvert.SerializeObject(qlinkTransactionRequest);

                HttpClientSettings httpClientSettings = new HttpClientSettings();
                httpClientSettings.AddDefaultRequestHeader(OcpApimSubscriptionKeyHeader, qlinkSubscriptionKey);

                using (var data = new StringContent(payLoad, Encoding.UTF8, "application/json"))
                {
                    var responseMessage = await _httpClientService.PostAsync(httpClientSettings, qlinkTransactionApiUrl, data);
                    var responseString = await responseMessage.Content.ReadAsStringAsync();
                    var qlinkTransactionResponse = JsonConvert.DeserializeObject<QlinkTransactionResponse>(responseString);

                    var reservationTransactionTypes = new List<Admin.MasterDataManager.Contracts.Enums.QLinkTransactionTypeEnum>
                    {   Admin.MasterDataManager.Contracts.Enums.QLinkTransactionTypeEnum.QAFA,
                        Admin.MasterDataManager.Contracts.Enums.QLinkTransactionTypeEnum.QAFU
                    };

                    if (reservationTransactionTypes.Contains(qlinkTransactionRequest.TransactionType))
                    {
                        qlinkTransactionRequest.ReservationNumber = qlinkTransactionResponse.ReservationNumber;
                        payLoad = JsonConvert.SerializeObject(qlinkTransactionRequest);
                    }

                    var qlinkTransaction = new QlinkTransactionModel
                    {
                        Request = payLoad,
                        Response = responseString,
                        ItemType = qlinkTransactionRequest.ItemType,
                        ItemId = qlinkTransactionRequest.ItemId,
                        StatusCode = Convert.ToInt32(qlinkTransactionResponse.StatusCode),
                        QLinkTransactionType = qlinkTransactionRequest.TransactionType,
                        CreatedBy = RmaIdentity.Email,
                        ModifiedBy = RmaIdentity.Email,
                        CreatedDate = DateTimeHelper.SaNow,
                        ModifiedDate = DateTimeHelper.SaNow,
                    };

                    qlinkTransactionResponses.Add(qlinkTransaction);
                }
            }

            return qlinkTransactionResponses;

        }

    }
}



