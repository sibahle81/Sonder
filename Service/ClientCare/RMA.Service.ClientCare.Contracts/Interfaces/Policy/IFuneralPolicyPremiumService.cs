using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IFuneralPolicyPremiumService : IService
    {
        Task<FuneralPolicyPremium> GetIndividualPolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage);
        Task<FuneralPolicyPremium> GetGroupPolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage);
        Task<FuneralPolicyPremium> GetGroupSchemePolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage);
    }
}
