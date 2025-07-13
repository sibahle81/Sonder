using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class GazetteFacade : RemotingStatelessService, IGazetteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_PensionGazette> _pensionGazetteRepository;

        public GazetteFacade(
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_PensionGazette> pensionGazetteRepository,
            StatelessServiceContext context) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _pensionGazetteRepository = pensionGazetteRepository;
        }

        public async Task<List<PensionGazetteResult>> GetPensionGazettesAsOfEffectiveDate(DateTime effectiveFromDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var results = await _pensionGazetteRepository
                    .Where(s => s.EffectiveFrom == effectiveFromDate)
                    .ToListAsync();

                return MapToPensionGazetteResults(results);
            }
        }

        private List<PensionGazetteResult> MapToPensionGazetteResults(List<common_PensionGazette> pensionGazettes)
        {
            return pensionGazettes
                .GroupBy(e => new { e.PensionGazetteType, e.EffectiveFrom, e.EffectiveTo })
                .Select(group => new PensionGazetteResult
                {
                    PensionGazetteId = group.ToList().FirstOrDefault()?.PensionGazetteId ?? 0,
                    PensionGazetteType = group.Key.PensionGazetteType,
                    EffectiveFrom = group.Key.EffectiveFrom,
                    EffectiveTo = group.Key.EffectiveTo,
                    Increases = group.Select(e => new PensionGazetteIncrease
                    {
                        IncidentMinDate = e.IncidentMinDate,
                        IncidentMaxDate = e.IncidentMaxDate,
                        ValueType = e.PensionGazetteValueType,
                        Value = e.Value
                    }).ToList()
                })
                .ToList();
        }
    }
}
