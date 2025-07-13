using Hyphen.FACS;

using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IBankFacsRequestService : IService
    {
        Task<RootBankFACSConfirmation> SubmitCollection(Collection collection, BankAccount collectionAccount, int roleplayerId);
    }
}