using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IEnquiryQueryTypeService : IService
    {
        Task<List<Lookup>> GetEnquiryQueryTypes();
    }
}