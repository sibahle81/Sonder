using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IFatalService : IService
    {
        Task<PersonEvent> GetFatal(int fatalId);
        Task<FuneralRuleResult> ExecuteFuneralClaimRegistrationRules(RuleRequest ruleRequest);
    }
}
