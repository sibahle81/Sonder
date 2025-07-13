using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;
using System.Linq;
using System.Diagnostics.Contracts;
namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class CoverTypeFacade : RemotingStatelessService, ICoverTypeService
    {
        public CoverTypeFacade(StatelessServiceContext context) : base(context)
        {
        }

        public async Task<List<Lookup>> GetCoverTypes()
        {
            return await Task.Run(() => typeof(CoverTypeEnum).ToLookupList());
        }

        public async Task<List<Lookup>> GetCoverTypesByIds(List<int> ids)
        {
            Contract.Requires(ids != null);
            var coverTypes = await Task.Run(() => typeof(CoverTypeEnum).ToLookupList());
            return (from coverType in coverTypes
                    where ids.Contains(coverType.Id)
                    select coverType).ToList();
        }
        public async Task<List<Lookup>> GetCoverTypesByProduct(string product)
        {
            var coverTypes = await Task.Run(() => typeof(CoverTypeEnum).ToLookupList());
            return (from coverType in coverTypes
                    where coverType.Name.Contains(product)
                    select coverType).ToList();
        }
    }
}