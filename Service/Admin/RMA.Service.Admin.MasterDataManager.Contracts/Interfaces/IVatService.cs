using Microsoft.ServiceFabric.Services.Remoting;

using System;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IVatService : IService
    {
        Task<decimal> GetVatAmount(int vatCodeId, DateTime serviceDate);

    }
}