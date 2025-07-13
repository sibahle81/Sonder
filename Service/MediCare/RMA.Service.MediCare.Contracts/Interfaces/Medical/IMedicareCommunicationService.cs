using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IMedicareCommunicationService : IService
    {
        Task SendAuthorizedFormLetter(string PreAuthNumber, string ClaimId, List<string> toEmailAddresses,PreAuthTypeEnum authType);
    }
}

