using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IPensionMedicalPlanService : IService
    {
        Task<PmpRegionTransfer> GetPmpRegionTransfer(int pmpRegionTransferId);
        Task<List<PmpRegionTransfer>> GetPmpRegionTransferByClaimId(int claimId);
        Task<int> CreatePmpRegionTransfer(PmpRegionTransfer pmpRegionTransfer);
        Task<int> UpdatePmpRegionTransfer(PmpRegionTransfer pmpRegionTransfer);
        Task<PensionerInterviewForm> GetPensionerInterviewFormDetailById(int pensionerInterviewFormId);
        Task<List<PensionerInterviewForm>> GetPensionerInterviewFormByPensionerId(int pensionerId);
        Task<int> CreatePensionerInterviewFormDetail(PensionerInterviewForm pensionerInterviewForm);
        Task<int> UpdatePensionerInterviewForm(PensionerInterviewForm pensionerInterviewForm);
    }
}
