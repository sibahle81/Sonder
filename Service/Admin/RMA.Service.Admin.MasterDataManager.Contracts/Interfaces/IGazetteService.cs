using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IGazetteService : IService
    {
        Task<List<PensionGazetteResult>> GetPensionGazettesAsOfEffectiveDate(DateTime effectiveFromDate);
    }
}