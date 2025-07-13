using Newtonsoft.Json;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities.CompCare;
using RMA.Service.Integrations.Contracts.Interfaces.CompCare;
using System;
using System.Fabric;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Services.CompCare
{
    public class CCClaimsFacade : RemotingStatelessService, ICCClaimsService
    {
        private readonly IConfigurationService _configuration;

        public CCClaimsFacade(
            StatelessServiceContext context, IConfigurationService configuration) : base(context)
        {
            _configuration = configuration;
        }


        public async Task<RootCCClaimResponse> SendClaimsRequest(RootCCClaimRequest request)
        {
            //throw new NotImplementedException();

            var smsSubscriptionKey = "ae79a4c7abba46d5b7ca405640b57c9a"; //await _configuration.GetModuleSetting(SystemSettings.SMSOcpApimSubscriptionKey);


            var smsApiUrl = "https://apiqa.randmutual.co.za/medical/v1/claims";

            using (var httpClient = new HttpClient { BaseAddress = new Uri(smsApiUrl) })
            {

                httpClient.DefaultRequestHeaders.Accept.Clear();
                httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", smsSubscriptionKey);

                var uri = $"{httpClient.BaseAddress}";

                var claimRequest = JsonConvert.SerializeObject(request);//-1

                HttpResponseMessage response;
                byte[] byteData = Encoding.UTF8.GetBytes(claimRequest);

                //
                using (var content = new ByteArrayContent(byteData))
                {
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    var responseClaim = await httpClient.PostAsync(uri, content);
                    var responseString = await responseClaim.Content.ReadAsStringAsync();

                   //-- await SaveRequestResponse(request, CCResult);

                    return  JsonConvert.DeserializeObject<RootCCClaimResponse>(responseString);

                }

            }

        }//end





    }
}
