using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ICommutationReasonService
    {
        Task<List<Lookup>> GetCommutationReasons();
    }
}
