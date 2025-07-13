using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    using System;
    using System.Collections.Generic;

    using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

    public interface ISftpService : IService
    {
        Task<SftpRequestModel> CreateSftpRequest(SftpRequestModel sftpRequestModel);

        Task<List<SftpRequest>> GetSftpRequestsByRequestTypeAndStatus(
            SftpRequestTypeEnum requestTypeEnum,
            SftpRequestStatusEnum requestStatusEnum);

        Task<List<SftpResponse>> GetSftpRequestResponseStatus(List<SftpRequest> entityRequests);

        Task<List<SftpRequest>> GetSftpRequestByRequestTypeIdAndSourceRequestId(
            int  requestTypeId , int sourceRequestId);

        Task<List<SftpRequest>> GetSftpRequestsByRequestTypeAndDateRange(
            SftpRequestTypeEnum requestTypeEnum,
            DateTime dateFrom,
            DateTime dateTo);
        Task<List<SftpRequest>> GetSftpRequestsByRequestType(SftpRequestTypeEnum requestTypeEnum);
    }
}
