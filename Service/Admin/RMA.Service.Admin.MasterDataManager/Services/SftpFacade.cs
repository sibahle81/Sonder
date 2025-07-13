using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Newtonsoft.Json;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

namespace RMA.Service.Admin.MasterDataManager.Services
{

        public class SftpFacade : RemotingStatelessService, ISftpService
        {

            private readonly IDbContextScopeFactory _dbContextScopeFactory;

            private readonly IRepository<common_SftpRequest> _sftpRequestRepository;

            private readonly IRepository<common_SftpRequestItem> _sftpRequestItemRepository;

            private readonly IRepository<common_SftpRequestTypeConnection> _sftpRequestTypeConnectionRepository;

            private readonly IRepository<common_SftpResponse> _sftpResponseRepository;

            private readonly IConfigurationService _configuration;

            private readonly IHttpClientService _httpClientService;

            private readonly IMapper _mapper;

            private const string OcpApimSubscriptionKeyHeader = "Ocp-Apim-Subscription-Key";

            private readonly string _sftpResponseIntegrationSuccessStatus = "Received";


            public SftpFacade(
                StatelessServiceContext context,
                IDbContextScopeFactory dbContextScopeFactory,
                IRepository<common_SftpResponse> sftpResponseRepository,
                IRepository<common_SftpRequestTypeConnection> sftpRequestTypeConnectionRepository,
                IRepository<common_SftpRequestItem> sftpRequestItemRepository,
                IRepository<common_SftpRequest> sftpRequestRepository,
                IConfigurationService configuration,
                IHttpClientService httpClientService,
                IMapper mapper)
                : base(context)
            {
                _dbContextScopeFactory = dbContextScopeFactory;
                _sftpResponseRepository = sftpResponseRepository;
                _sftpRequestTypeConnectionRepository = sftpRequestTypeConnectionRepository;
                _sftpRequestItemRepository = sftpRequestItemRepository;
                _sftpRequestRepository = sftpRequestRepository;
                _configuration = configuration;
                _httpClientService = httpClientService;
                _mapper = mapper;
            }

            public async Task<List<SftpRequest>> GetSftpRequestsByRequestTypeAndDateRange(
                SftpRequestTypeEnum requestTypeEnum,
                DateTime dateFrom,
                DateTime dateTo)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    dateTo = dateTo.AddDays(1);
                    var entities = await _sftpRequestRepository
                                       .Where(x => x.SftpRequestType == requestTypeEnum && x.CreatedDate >= dateFrom
                                                   && x.CreatedDate <= dateTo).OrderByDescending(x => x.SftpRequestId)
                                       .ToListAsync();
                    return _mapper.Map<List<SftpRequest>>(entities);
                }
            }

            public async Task<List<SftpRequest>> GetSftpRequestsByRequestType(SftpRequestTypeEnum requestTypeEnum)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _sftpRequestRepository.Where(x => x.SftpRequestType == requestTypeEnum).OrderByDescending(x => x.SftpRequestId)
                                       .ToListAsync();
                    return _mapper.Map<List<SftpRequest>>(entities);
                }
            }

        public async Task<List<SftpRequest>> GetSftpRequestsByRequestTypeAndStatus(
                SftpRequestTypeEnum requestTypeEnum,
                SftpRequestStatusEnum requestStatusEnum)
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var entities = await _sftpRequestRepository.Where(x =>
                                           x.SftpRequestType == requestTypeEnum
                                           && x.SftpRequestStatus == requestStatusEnum)
                                       .ToListAsync();
                    return _mapper.Map<List<SftpRequest>>(entities);
                }
            }

            public async Task<SftpRequestModel> CreateSftpRequest(SftpRequestModel sftpRequestModel)
            {

                if (sftpRequestModel?.SftpRequestHeader == null)
                {
                    return null;
                }

                using (var scope = _dbContextScopeFactory.Create())
                {
                    sftpRequestModel.SftpRequestHeader.CreatedDate = DateTimeHelper.SaNow;
                    sftpRequestModel.SftpRequestHeader.ModifiedDate = DateTimeHelper.SaNow;
                    sftpRequestModel.SftpRequestHeader.RequestedDate = DateTimeHelper.SaNow;
                    sftpRequestModel.SftpRequestHeader.CreatedBy = RmaIdentity.Email;
                    sftpRequestModel.SftpRequestHeader.ModifiedBy = RmaIdentity.Email;

                    var entity = _mapper.Map<common_SftpRequest>(sftpRequestModel.SftpRequestHeader);
                    _sftpRequestRepository.Create(entity);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    sftpRequestModel.SftpRequestHeader.SftpRequestId = entity.SftpRequestId;
                }

                if (sftpRequestModel.SftpRequestLineItems != null)
                {
                    await CreateSftpRequestLineItems(
                        sftpRequestModel.SftpRequestHeader.SftpRequestId,
                        sftpRequestModel.SftpRequestLineItems);
                }

                var requestIntegration = new SftpRequestIntegration
                                             {
                                                 RequestFileName = sftpRequestModel?.SftpRequestHeader.FileName,
                                                 RequestTypeId =
                                                     (int)sftpRequestModel?.SftpRequestHeader.SftpRequestType,
                                                 SourceRequestId = sftpRequestModel.SftpRequestHeader.SftpRequestId
                                             };

                var sftpResponseIntegration = await SubmitSftpRequest(requestIntegration);

                if (sftpResponseIntegration == null)
                {
                    return sftpRequestModel;
                }

                sftpRequestModel.SftpRequestHeader.SftpRequestStatus =
                    (sftpResponseIntegration.RequestStatus == _sftpResponseIntegrationSuccessStatus
                         ? SftpRequestStatusEnum.ResponsePartial
                         : SftpRequestStatusEnum.Error);

                using (var scope = _dbContextScopeFactory.Create())
                {
                    var entity = _mapper.Map<common_SftpRequest>(sftpRequestModel.SftpRequestHeader);
                    _sftpRequestRepository.Update(entity);

                    await scope.SaveChangesAsync().ConfigureAwait(false);

                }

                return sftpRequestModel;
            }

            private async Task<bool> CreateSftpRequestLineItems(
                int sftpRequestId,
                List<SftpRequestItem> sftpRequestLineItems)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    if (sftpRequestLineItems == null)
                    {
                        return false;
                    }

                    var entities = _mapper.Map<List<common_SftpRequestItem>>(sftpRequestLineItems);

                    foreach (var entity in entities)
                    {
                        entity.SftpRequestId = sftpRequestId;
                    }

                    _sftpRequestItemRepository.Create(entities, false);
                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    return entities.Count > 0;
                }
            }

            public async Task<List<SftpRequest>> GetSftpRequestByRequestTypeIdAndSourceRequestId(
                int requestTypeId,
                int sourceRequestId)
            {
                var entityRequests = new List<SftpRequest>();

                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    if (requestTypeId > 0 && sourceRequestId > 0)
                    {
                        var entities = await _sftpRequestRepository.Where(x =>
                                           x.SftpRequestId == sourceRequestId
                                           && (int)x.SftpRequestType == requestTypeId).ToListAsync();

                        if (entities == null)
                        {
                            return entityRequests;
                        }

                        var request = _mapper.Map<List<SftpRequest>>(entities);
                        entityRequests.AddRange(request);

                    }
                    else
                    {
                        var entities = await _sftpRequestRepository
                                           .Where(x => x.SftpRequestStatus == SftpRequestStatusEnum.Requested)
                                           .ToListAsync();
                        if (entities == null)
                        {
                            return entityRequests;
                        }

                        var request = _mapper.Map<List<SftpRequest>>(entities);
                        entityRequests.AddRange(request);
                    }
                }

                return entityRequests;
            }

            public async Task<List<SftpResponse>> GetSftpRequestResponseStatus(List<SftpRequest> entityRequests)
            {

                if (entityRequests == null)
                {
                    return null;
                }

                var entityResponse = new List<SftpResponse>();

                foreach (var entityRequest in entityRequests)
                {
                    var sftpStatusRequestIntegration = new SftpStatusRequestIntegration
                                                           {
                                                               RequestTypeId = (int)entityRequest.SftpRequestType,
                                                               SourceRequestId = entityRequest.SftpRequestId
                                                           };

                    var sftpStatusResponseIntegration = await this.QuerySftpRequestStatus(sftpStatusRequestIntegration);

                    if (sftpStatusResponseIntegration == null)
                    {
                        continue;
                    }

                    using (var scope = this._dbContextScopeFactory.Create())
                    {
                        var sftpResponse = new SftpResponse
                                               {
                                                   SftpRequestId = sftpStatusRequestIntegration.SourceRequestId,
                                                   FileName = sftpStatusResponseIntegration.ResponseFileName,
                                                   ResponseDate = sftpStatusResponseIntegration.ResponseDate,
                                                   CreatedBy = RmaIdentity.Email,
                                                   CreatedDate = DateTimeHelper.SaNow,
                                                   ModifiedBy = RmaIdentity.Email,
                                                   ModifiedDate = DateTimeHelper.SaNow,
                                                   ErrorMessage = sftpStatusResponseIntegration.ErrorMessage,
                                               };

                        var entity = _mapper.Map<common_SftpResponse>(sftpResponse);
                        _sftpResponseRepository.Create(entity);
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                        sftpResponse.SftpResponseId = entity.SftpResponseId;
                        entityResponse.Add(sftpResponse);

                    }

                    using (var scope = this._dbContextScopeFactory.Create())
                    {
                        entityRequest.SftpRequestStatus =
                            string.IsNullOrWhiteSpace(sftpStatusResponseIntegration.ErrorMessage)
                                ? SftpRequestStatusEnum.ResponseReceived
                                : SftpRequestStatusEnum.Error;
                        entityRequest.ModifiedBy = RmaIdentity.Email;
                        entityRequest.ModifiedDate = DateTimeHelper.SaNow;
                        var dbEntityRequest = _mapper.Map<common_SftpRequest>(entityRequest);
                        _sftpRequestRepository.Update(dbEntityRequest);
                        await scope.SaveChangesAsync().ConfigureAwait(false);

                    }

                }

                return entityResponse;
            }


            private async Task<SftpStatusResponseIntegration> SubmitSftpRequest(
                SftpRequestIntegration requestIntegration)
            {
                var sftpSubmitRequestApiUrl =
                    await _configuration.GetModuleSetting(SystemSettings.SftpSubmitRequestApiUrl);
                var sftpOcpApimSubscriptionKey =
                    await _configuration.GetModuleSetting(SystemSettings.SftpOcpApimSubscriptionKey);

                var sftpQueryRequestStatusApiUrl =
                    await _configuration.GetModuleSetting(SystemSettings.SftpQueryRequestStatusApiUrl);


                var payLoad = JsonConvert.SerializeObject(requestIntegration);

                var httpClientSettings = new HttpClientSettings();
                httpClientSettings.AddDefaultRequestHeader(OcpApimSubscriptionKeyHeader, sftpOcpApimSubscriptionKey);

                using (var data = new StringContent(payLoad, Encoding.UTF8, "application/json"))
                {
                    var responseMessage = await _httpClientService.PostAsync(
                                              httpClientSettings,
                                              sftpQueryRequestStatusApiUrl,
                                              data);
                    var responseString = await responseMessage.Content.ReadAsStringAsync();
                    var sftpStatusResponseIntegration =
                        JsonConvert.DeserializeObject<SftpStatusResponseIntegration>(responseString);

                    return sftpStatusResponseIntegration;
                }

            }

            private async Task<SftpStatusResponseIntegration> QuerySftpRequestStatus(
                SftpStatusRequestIntegration sftpStatusRequestIntegration)
            {
                var sftpQueryRequestStatusApiUrl =
                    await _configuration.GetModuleSetting(SystemSettings.SftpQueryRequestStatusApiUrl);
                var sftpOcpApimSubscriptionKey =
                    await _configuration.GetModuleSetting(SystemSettings.SftpOcpApimSubscriptionKey);


                var payLoad = JsonConvert.SerializeObject(sftpStatusRequestIntegration);

                var httpClientSettings = new HttpClientSettings();
                httpClientSettings.AddDefaultRequestHeader(OcpApimSubscriptionKeyHeader, sftpOcpApimSubscriptionKey);

                using (var data = new StringContent(payLoad, Encoding.UTF8, "application/json"))
                {
                    var responseMessage = await _httpClientService.PostAsync(
                                              httpClientSettings,
                                              sftpQueryRequestStatusApiUrl,
                                              data);
                    var responseString = await responseMessage.Content.ReadAsStringAsync();
                    var sftpStatusResponseIntegration =
                        JsonConvert.DeserializeObject<SftpStatusResponseIntegration>(responseString);

                    return sftpStatusResponseIntegration;

                }

            }

        }
    }

