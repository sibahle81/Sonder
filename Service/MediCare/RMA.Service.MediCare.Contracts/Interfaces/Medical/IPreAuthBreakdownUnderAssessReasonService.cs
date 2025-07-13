using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.MediCare.Contracts.Entities.Medical;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IPreAuthBreakdownUnderAssessReasonService : IService
    {
        Task<int> AddPreAuthBreakdownUnderAssessReason(PreAuthBreakdownUnderAssessReason preAuthBreakdownUnderAssessReason);
        Task<List<PreAuthBreakdownUnderAssessReason>> GetPreAuthBreakdownUnderAssessReasonByPreAuthBreakdownId(int preAuthBreakdownId);
        Task<int> DeletePreAuthBreakdownUnderAssessReason(PreAuthBreakdownUnderAssessReason preAuthBreakdownUnderAssessReason);
    }
}
