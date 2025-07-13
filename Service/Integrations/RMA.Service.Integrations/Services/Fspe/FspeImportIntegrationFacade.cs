using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities.Fspe;
using RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration;
using RMA.Service.Integrations.Contracts.Interfaces.Fspe;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Services.Fspe
{
    public class FspeImportIntegrationFacade : RemotingStatelessService, IFspeImportIntegrationService
    {
        private readonly string _subscriptionKey;
        private readonly string _serviceEndpoint;
        private readonly string _subscriptionListName;
        private const string _getAllFromSubscriptionListAppendUrl = "Async/GetAllFromSubscriptionList";
        private const string _submitSubscriptionListAppendUrl = "SubmitSubscriptionList";
        private readonly IConfigurationService _configurationService;
        private readonly IHttpClientService _httpClientService;

        public FspeImportIntegrationFacade(
            StatelessServiceContext context,
            IConfigurationService configuration,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _configurationService = configuration;
            _serviceEndpoint = configuration?.GetModuleSetting(SystemSettings.FSPEApiUrl).Result;
            _subscriptionKey = configuration?.GetModuleSetting(SystemSettings.FSPEOcpApimSubscriptionKey).Result;
            _subscriptionListName = configuration?.GetModuleSetting(SystemSettings.FSPESubscriptionListName).Result;
            _httpClientService = httpClientService;
        }

        public async Task<RootGetAllFromSubscriptionListResponse> GetAllFromSubscriptionListAsync()
        {
            RootGetAllFromSubscriptionList root = new RootGetAllFromSubscriptionList
            {
                GetAllFromSubscriptionList = new GetAllFromSubscriptionList()
            };

            string payLoad = JsonConvert.SerializeObject(root);
            var uri = _serviceEndpoint + _getAllFromSubscriptionListAppendUrl;
            var byteData = Encoding.UTF8.GetBytes(s: payLoad);

            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", _subscriptionKey);

            using (var content = new ByteArrayContent(byteData))
            {
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var responseMsg = await _httpClientService.PostAsync(httpClientSettings, uri, content);
                if (responseMsg.IsSuccessStatusCode)
                {
                    var responseString = await responseMsg.Content.ReadAsStringAsync();
                    var verificationResult = JsonConvert.DeserializeObject<RootGetAllFromSubscriptionListResponse>(responseString);
                    return verificationResult;
                }
                else
                {
                    throw new System.Exception($"Error {(int)responseMsg.StatusCode}: {responseMsg.ReasonPhrase}");
                }
            }
        }

        public async Task<RootSubmitSubscriptionListResponse> SubmitSubscriptionListAsync(List<FSPSubscription> subscriptionList)
        {
            RootSubmitSubscriptionList rootSubmitSubscriptionList = new RootSubmitSubscriptionList
            {
                SubmitSubscriptionList = new SubmitSubscriptionList
                {
                    SubscriptionListName = _subscriptionListName// + "-" + DateTimeHelper.SaNow.ToString("yyyyMMdd")
                }
            };

            rootSubmitSubscriptionList.SubmitSubscriptionList.FSPSubscriptions = subscriptionList?.ToArray();

            var payLoad = JsonConvert.SerializeObject(rootSubmitSubscriptionList);
            var uri = _serviceEndpoint + _submitSubscriptionListAppendUrl;
            var byteData = Encoding.UTF8.GetBytes(s: payLoad);

            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", _subscriptionKey);

            using (var content = new ByteArrayContent(byteData))
            {
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var responseMsg = await _httpClientService.PostAsync(httpClientSettings, uri, content);
                if (responseMsg.IsSuccessStatusCode)
                {
                    var responseString = await responseMsg.Content.ReadAsStringAsync();
                    return JsonConvert.DeserializeObject<RootSubmitSubscriptionListResponse>(responseString);
                }
                else
                {
                    throw new System.Exception($"Error {(int)responseMsg.StatusCode}: {responseMsg.ReasonPhrase}");
                }
            }
        }


        public async Task<List<Fsp>> ProcessFSPDataImportResponseAsync(string claimCheckReference)
        {
            if (string.IsNullOrEmpty(claimCheckReference)) return null;

            string responseString;
            var fsps = new List<Fsp>();

            var fSPEApiUrl = await _configurationService.GetModuleSetting(SystemSettings.FSPEApiUrl);
            var fSPEOcpApimSubscriptionKey = await _configurationService.GetModuleSetting(SystemSettings.FSPEOcpApimSubscriptionKey);

            HttpResponseMessage responseMessage;
            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", fSPEOcpApimSubscriptionKey);
            var url = $"{fSPEApiUrl}response/{claimCheckReference}";

            responseMessage = await _httpClientService.GetAsync(httpClientSettings, url);
            responseString = await responseMessage.Content.ReadAsStringAsync();

            responseString = responseString.Replace("\\r\\n", "").Replace("\\", "").Trim('"');
            var res = responseString.DeserializeXMLToObject<V3FSPPublicationResponse>();

            if (res != null)
                fsps = MapImportIntegrationFspeData(res.FSPEResponse.FSPs);
            return fsps;
        }

        private List<Fsp> MapImportIntegrationFspeData(FSPs fSPs)
        {
            var brokerages = new List<Fsp>();
            if (fSPs?.FSP?.Count > 0)
            {
                foreach (var fsp in fSPs.FSP)
                {
                    var broker = new Fsp
                    {
                        Name = fsp.FspName,
                        RegNo = fsp.FspReg,
                        FspNumber = fsp.FspNo,
                        FspWebsite = string.Empty,
                        CompanyType = GetFspTypeSplit(fsp.FspType, 1),
                        FinYearEnd = "00/00",
                        LegalCapacity = GetFspTypeSplit(fsp.FspType, 0),
                        MedicalAccreditationNo = "0000",
                        Status = fsp.FspStatus,
                        TelNo = "000 000 0000",
                        FaxNo = "000 000 0000",
                        TradeName = fsp.FspName
                    };

                    broker.IsActive = fsp.FspStatus == "Authorized";

                    broker.Categories = (fsp.FspProducts.FspProduct.Select(product => new FspLicenseCategory()
                    {
                        CategoryNo = int.Parse(product.CategoryNo),
                        IntermediaryDateActive = fsp.FspDateAuthorised.ParseDateTimeNullable(),
                        AdviceDateActive = fsp.FspDateAuthorised.ParseDateTimeNullable(),
                        SubCategoryNo = int.Parse(product.SubCategoryNo)
                    })).ToList();

                    broker.Addresses = new List<Address>();


                    broker.ComplianceOfficer = new ComplianceOfficer()
                    {
                        Name = "NOT PROVIDED",
                        DateAppointed = fsp.FspDateAuthorised,
                        PracticeName = fsp.FspName,
                        TelNo = "000 000 0000"
                    };

                    broker.ContactPerson = new ContactPerson()
                    {
                        Name = "N/A",
                        Email = string.Empty,
                        Surname = string.Empty,
                        Title = string.Empty
                    };

                    if (fsp.KeyIndividuals.KeyIndividual?.Count > 0)
                    {
                        broker.KeyIndividuals = MapFspeKeyIndividualData(fsp.KeyIndividuals);
                    }
                    if (fsp.Representatives?.Representative?.Count > 0)
                    {
                        broker.Representatives = MapFspeRepresentativeData(fsp.Representatives);
                    }

                    brokerages.Add(broker);
                }
            }

            return brokerages;
        }

        private List<RepEntity> MapFspeRepresentativeData(Representatives representatives)
        {
            var repEntities = new List<RepEntity>();

            if (representatives.Representative?.Count > 0)
            {
                foreach (var rep in representatives.Representative)
                {
                    var updatedRep = new RepEntity
                    {
                        FirstName = rep.Name,
                        SurnameOrCompanyName = rep.Surname,
                        IdNumber = rep.IdentityNumber,
                        DateOfAppointment = rep.DateAppointed.ParseDateTime(),
                        CountryOfRegistration = "South Africa",
                        DateOfBirth = rep.IdentityNumber.GetDateOfBirthFromRSAIdNumber(),
                        Initials = rep.Name.Substring(0, 1),
                        MedicalAccreditationNo = string.Empty,
                        Title = string.Empty,
                        /*
                        PhysicalAddress = new Address()
                        {
                            AddressType = AddressTypeEnum.Physical,
                            City = rep.PhysicalAddress.City,
                            Line1 = rep.PhysicalAddress.Line1,
                            Line2 = rep.PhysicalAddress.Line2,
                            Code = rep.PhysicalAddress.Zip
                        }
                        */
                    };


                    if (rep.Products.RepProduct?.Count > 0)
                    {
                        updatedRep.Categories = rep.Products.RepProduct.Select(product => new RepLicenseCategory()
                        {
                            CategoryNo = int.Parse(product.CategoryNo),
                            IntermediaryDateActive = product.IntermediaryFirstDate.ParseDateTimeNullable(),
                            AdviceDateActive = product.AdviceFirstDate.ParseDateTimeNullable(),
                            SubCategoryNo = int.Parse(product.SubCategoryNo),
                            SusDateActive = null,
                            FspNumber = null
                        }).ToList();
                    }
                    updatedRep.RepType = updatedRep.DateOfBirth == null ? RepTypeEnum.Juristic : RepTypeEnum.Natural;
                    updatedRep.IdType = updatedRep.DateOfBirth == null ? IdTypeEnum.Other : IdTypeEnum.SAIDDocument;

                    repEntities.Add(updatedRep);
                }
            }
            return repEntities;
        }

        private List<RepEntity> MapFspeKeyIndividualData(KeyIndividuals keyIndividuals)
        {
            var repEntities = new List<RepEntity>();

            if (keyIndividuals.KeyIndividual?.Count > 0)
            {
                foreach (var rep in keyIndividuals.KeyIndividual)
                {
                    var updatedRep = new RepEntity
                    {
                        FirstName = rep.Name,
                        SurnameOrCompanyName = rep.Surname,
                        IdNumber = rep.IdentityNumber,
                        DateOfAppointment = rep.DateAppointed.ParseDateTime(),
                        CountryOfRegistration = "South Africa",
                        DateOfBirth = rep.IdentityNumber.GetDateOfBirthFromRSAIdNumber(),
                        Initials = rep.Name.Substring(0, 1),
                        MedicalAccreditationNo = string.Empty,
                        Title = string.Empty,
                        /*
                        PhysicalAddress = new Address()
                        {
                            AddressType = AddressTypeEnum.Physical,
                            City = rep.PhysicalAddress.City,
                            Line1 = rep.PhysicalAddress.Line1,
                            Line2 = rep.PhysicalAddress.Line2,
                            Code = rep.PhysicalAddress.Zip
                        }
                        */
                    };

                    if (rep.Products.RepProduct?.Count > 0)
                    {
                        updatedRep.Categories = rep.Products.RepProduct.Select(product => new RepLicenseCategory()
                        {
                            CategoryNo = int.Parse(product.CategoryNo),
                            IntermediaryDateActive = product.AdviceFirstDate.ParseDateTimeNullable(),
                            AdviceDateActive = product.AdviceFirstDate.ParseDateTimeNullable(),
                            SubCategoryNo = int.Parse(product.SubCategoryNo),
                            SusDateActive = null,
                            FspNumber = null
                        }).ToList();
                    }
                    updatedRep.RepType = updatedRep.DateOfBirth == null ? RepTypeEnum.Juristic : RepTypeEnum.Natural;
                    updatedRep.IdType = updatedRep.DateOfBirth == null ? IdTypeEnum.Other : IdTypeEnum.SAIDDocument;

                    repEntities.Add(updatedRep);
                }
            }
            return repEntities;
        }

        private string GetFspTypeSplit(string fspType, int pos)
        {
            if (!fspType.Contains('-')) return fspType;

            string[] split = fspType.Split('-');
            return split[pos].Trim();
        }
    }
}
