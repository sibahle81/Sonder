using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class PaymentMethodFacade : RemotingStatelessService, IPaymentMethodService
    {

        public PaymentMethodFacade(StatelessServiceContext context) : base(context)
        {
        }

        public async Task<List<Lookup>> GetPaymentMethods()
        {
            return await Task.Run(() => typeof(PaymentMethodEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetPaymentFrequencyByIds(List<int> ids)
        {
            var paymentmethods = await Task.Run(() => typeof(PaymentFrequencyEnum).ToLookupList());
            var list = paymentmethods.Where(r => ids.Contains(r.Id)).ToList();
            return list;
        }
    }
}