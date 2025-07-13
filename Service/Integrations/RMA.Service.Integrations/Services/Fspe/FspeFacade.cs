using AutoMapper;

using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.AstuteFspeV2;
using RMA.Service.Integrations.Contracts.Entities.Fspe;
using RMA.Service.Integrations.Contracts.Interfaces.Fspe;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Services.Fspe
{
    public class FspeFacade : RemotingStatelessService, IFspeService
    {
        private const string CarrierCode = "RMA";
        private readonly string _astuteUn;
        private readonly string _astutePw;
        private readonly string _asuteUrl;

        public FspeFacade(StatelessServiceContext context, IConfigurationService configuration) : base(context)
        {
            _asuteUrl = configuration?.GetModuleSetting(SystemSettings.AstuteUrl).Result;
            _astuteUn = configuration?.GetModuleSetting(SystemSettings.AstuteUserName).Result;
            _astutePw = configuration?.GetModuleSetting(SystemSettings.AstutePassword).Result;

        }

        public async Task<List<Fsp>> GetFspDetails(List<string> fspNumbers)
        {
            var mappedData = new List<Fsp>();
            string reference = Guid.NewGuid().ToString();
            await SetSubscriptionList(reference, fspNumbers);

            using (var client = CreateClient())
            {
                var details = await client.GetAllFromSubscriptionListAsync(new GetAllFromSubscriptionListRequest()
                {
                    Request = new GetAllFromSubscriptionListRequestRequest()
                    {
                        CarrierCode = CarrierCode,
                        Reference = reference,
                        RequestData = null
                    }
                });

                mappedData = FspeDataProcessor.MapFspeBrokerageData(details.FSPs);
            }
            return mappedData;
        }

        private FSPEnquiryClient CreateClient()
        {
            var endpoint = new EndpointAddress(_asuteUrl);
            var binding = new WSHttpBinding(SecurityMode.TransportWithMessageCredential)
            {
                MaxReceivedMessageSize = 2147483647
            };
            binding.Security.Transport.ClientCredentialType = HttpClientCredentialType.None;
            binding.Security.Message.ClientCredentialType = MessageCredentialType.UserName;
            binding.Security.Message.EstablishSecurityContext = false;

            var client = new AstuteFspeV2.FSPEnquiryClient(binding, endpoint);
            client.ClientCredentials.UserName.UserName = _astuteUn;
            client.ClientCredentials.UserName.Password = _astutePw;
            return client;
        }

        public async Task<List<object>> GetDebarredInfo(List<string> idNumbers)
        {
            string reference = Guid.NewGuid().ToString();

            using (var client = CreateClient())
            {
                var details = await client.GetDebarredByRepresentativeAsync(new GetDebarredByRepresentativeRequest()
                {
                    BatchReference = new BatchReference() { Value = reference, BatchSeqNo = 1, TotalBatches = 1 },
                    CarrierCode = new CarrierCode() { Reference = reference, Value = CarrierCode },
                    Representatives = new RepQueryParameter()
                    {
                        EnablePartialSAIDNumberSearch = YesNoType.No,
                        EnablePartialSAIDNumberSearchSpecified = true,
                        IDReferenceNo = idNumbers.Select(n => new IDReferenceNo() { Value = n, IDType = IDType.ID }).ToArray()
                    }
                });

                return Mapper.Map<List<object>>(details);
            }
        }

        /// <summary>
        ///  Sets the subscription list @Astute to the data that needs to be collected, this method uses only the FSP numbers
        /// </summary>
        /// <param name="reference"></param>
        /// <param name="fspNumbers"></param>
        /// <returns></returns>
        public async Task SetSubscriptionList(string reference, List<string> fspNumbers)
        {
            using (var client = CreateClient())
            {
                await client.SubmitSubscriptionListAsync(new SubmitSubscriptionListRequest()
                {

                    BatchReference = new BatchReference() { Value = reference, BatchSeqNo = 1, TotalBatches = 1 },
                    CarrierCode = new CarrierCode() { Reference = reference, Value = CarrierCode },
                    FSPs = new FspQueryParameter()
                    {
                        EnablePartialSAIDNumberSearch = YesNoType.No,
                        EnablePartialSAIDNumberSearchSpecified = true,
                        FSP = fspNumbers.Select(n => new FspQueryParameterFSP()
                        { FSPReferenceNumber = n, Representatives = null }).ToArray()
                    }
                });
            }
        }


    }
}

