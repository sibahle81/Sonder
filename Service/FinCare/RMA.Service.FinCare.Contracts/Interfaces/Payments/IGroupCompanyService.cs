using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IGroupCompanyService : IService
    {
        Task<GroupCompany> GetGroupCompany(bool IsCoid, bool IsCompensation, bool IsPension, IndustryClassEnum? industryClassEnum);
        Task<GroupCompany> GetGroupCompanyByAccount(string accountNumber);
    }
}
