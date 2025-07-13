using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.FinCare.Contracts.Entities.Payments;

using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IProductCrossRefTranTypeService : IService
    {
        Task<ProductCrossRefTranType> GetProductCrossRefTranTypeForPosting(string origin, string companyNo, string branchNo, string benefitCode);
    }
}
