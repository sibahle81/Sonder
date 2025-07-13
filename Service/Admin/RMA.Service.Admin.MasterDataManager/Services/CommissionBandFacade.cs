using AutoMapper;
using AutoMapper.QueryableExtensions;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.Audit.Contracts.Interfaces;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class CommissionBandFacade : RemotingStatelessService, ICommissionBandService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_CommissionBand> _commissionBandRepository;
        private readonly IAuditWriter _commissionBandAuditWriter;
        private readonly IAuditLogV1Service _auditLogService;
        private readonly IMapper _mapper;
        public CommissionBandFacade(StatelessServiceContext context,
          IDbContextScopeFactory dbContextScopeFactory,
          IAuditWriter commissionBandAuditWriter,
          IAuditLogV1Service auditLogService,
          IRepository<common_CommissionBand> commissionBandRepository,
          IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _commissionBandRepository = commissionBandRepository;
            _commissionBandAuditWriter = commissionBandAuditWriter;
            _auditLogService = auditLogService;
            _mapper = mapper;
        }
        public async Task<List<CommissionBand>> GetCommissionBands()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var commissionBands = await _commissionBandRepository
                    .ProjectTo<CommissionBand>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return commissionBands;
            }
        }

        public async Task<CommissionBand> GetCommissionBandById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var commissionBand = await _commissionBandRepository
                    .ProjectTo<CommissionBand>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.CommissionBandId == id,
                        $"Could not find commissionband with id {id}");

                await _commissionBandAuditWriter.AddLastViewed<common_CommissionBand>(id);

                return commissionBand;
            }
        }

        public async Task<CommissionBand> GetCommissionBandByName(string name)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var commissionBand = await _commissionBandRepository
                    .ProjectTo<CommissionBand>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.CommissionBandName == name,
                        $"Could not find commissionband with name {name}");

                return commissionBand;
            }
        }

        public async Task<int> AddCommissionBand(CommissionBand commissionBand)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_CommissionBand>(commissionBand);
                _commissionBandRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);

                await _commissionBandAuditWriter.AddLastViewed<common_CommissionBand>(entity.CommissionBandId);
                AddAuditEntry(entity, true, null);

                return entity.CommissionBandId;
            }
        }

        public async Task EditCommissionBand(CommissionBand commissionBand)
        {
            Contract.Requires(commissionBand != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _commissionBandRepository.Where(c => c.CommissionBandId == commissionBand.CommissionBandId).SingleAsync();
                entity.CommissionBandName = commissionBand.CommissionBandName;
                entity.MinSalaryBand = commissionBand.MinSalaryBand;
                entity.MaxSalaryBand = commissionBand.MaxSalaryBand;
                entity.CommissionRate = commissionBand.CommissionRate;
                _commissionBandRepository.Update(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                await _commissionBandAuditWriter.AddLastViewed<common_CommissionBand>(commissionBand.CommissionBandId);
                AddAuditEntry(entity, false, null);
            }
        }

        public async Task RemoveCommissionBandRepository(int id)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _commissionBandRepository.Delete(d => d.CommissionBandId == id);
                await scope.SaveChangesAsync();
            }
        }

        private void AddAuditEntry(common_CommissionBand entity, bool isNewEntry, int? wizardId)
        {

            var newAudit = new AuditResult()
            {
                ItemId = entity.CommissionBandId,
                ItemType = "common_CommissionBand",
                Action = isNewEntry ? "Added" : "Modified",

                NewItem = JsonConvert.SerializeObject(entity),
                Date = DateTimeHelper.SaNow,
                Username = RmaIdentity.Username,
                CorrolationToken = RmaIdentity.TraceId,
                WizardId = wizardId
            };

            newAudit.OldItem = AddOldItem(entity);
            newAudit.NewItem = ParseCommissionBand(newAudit.NewItem);
            _auditLogService.AddAudit(newAudit).GetAwaiter().GetResult();
        }

        private string AddOldItem(common_CommissionBand commissionBand)
        {
            using (_dbContextScopeFactory.Create())
            {
                var audits = _auditLogService.GetAuditLogs("common_CommissionBand", commissionBand.CommissionBandId).GetAwaiter().GetResult();
                if (audits.Count == 0)
                {
                    return "{ }";
                }

                var audit = audits.OrderByDescending(a => a.Id).FirstOrDefault();
                return audit.NewItem;
            }
        }

        private static string ParseCommissionBand(string newItemString)
        {
            if (newItemString == null) return "{ }";
            var item = JObject.Parse(newItemString);

            return item.ToString(Formatting.None);
        }
    }
}
