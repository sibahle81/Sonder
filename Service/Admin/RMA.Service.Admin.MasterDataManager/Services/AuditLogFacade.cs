using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Audit;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.Audit.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class AuditLogFacade : RemotingStatelessService, IAuditLogService
    {
        private readonly IAuditLogV1Service _auditLogService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_ReportViewedAudit> _reportViewedAuditsRepository;
        private readonly IMapper _mapper;

        public AuditLogFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IAuditLogV1Service auditLogService
            , IRepository<common_ReportViewedAudit> reportViewedAuditsRepository
            , IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _auditLogService = auditLogService;
            _reportViewedAuditsRepository = reportViewedAuditsRepository;
            _mapper = mapper;
        }

        public async Task<AuditResult> GetAuditLog(int id)
        {
            var result = await _auditLogService.GetAuditLog(id);
            Action<AuditResult> getLookupDetails = DataLookup;
            result.ExtractPropertyDetails(getLookupDetails);
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogsByToken(string correlationToken)
        {
            var result = await _auditLogService.GetAuditLogsByToken(correlationToken);
            Action<AuditResult> getLookupDetails = DataLookup;
            result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            return result;
        }

        public async Task<List<AuditResult>> GetAuditLogs(string itemType, int itemId)
        {
            var result = await _auditLogService.GetAuditLogs(itemType, itemId);
            Action<AuditResult> getLookupDetails = DataLookup;
            result.ForEach(d => d.ExtractPropertyDetails(getLookupDetails));
            return result;
        }

        private void DataLookup(AuditResult audit)
        {
            switch (audit.ItemType)
            {
                case "common_CommissionBand":
                    audit.OldItem = ParseItem(audit.OldItem);
                    audit.NewItem = ParseItem(audit.NewItem);
                    break;
            }
        }

        private static string ParseItem(string searchItem)
        {
            if (searchItem == null) return "{ }";
            dynamic item = JsonConvert.DeserializeObject<dynamic>(searchItem);

            return JsonConvert.SerializeObject(item);
        }

        public async Task CreateReportViewedAudit(ReportViewedAudit reportViewedAudit)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_ReportViewedAudit>(reportViewedAudit);
                _reportViewedAuditsRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PagedRequestResult<ReportViewedAudit>> GetPagedReportViewedAudit(ReportViewedAuditPagedRequest reportViewedAuditPagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(reportViewedAuditPagedRequest != null);

                var audits = await (from s in _reportViewedAuditsRepository
                                    where s.ReportUrl.Equals(reportViewedAuditPagedRequest.ReportUrl)
                                    && s.ItemId.Equals(reportViewedAuditPagedRequest.ItemId)
                                    && s.ItemType.Equals(reportViewedAuditPagedRequest.ItemType)
                                    select new ReportViewedAudit
                                    {
                                        ReportViewedAuditId = s.ReportViewedAuditId,
                                        UserId = s.UserId,
                                        ReportUrl = s.ReportUrl,
                                        Action = s.Action,
                                        ActionDate = s.ActionDate
                                    }
                    ).ToPagedResult(reportViewedAuditPagedRequest.PagedRequest);

                return new PagedRequestResult<ReportViewedAudit>
                {
                    Data = audits.Data,
                    RowCount = audits.RowCount,
                    Page = reportViewedAuditPagedRequest.PagedRequest.Page,
                    PageSize = reportViewedAuditPagedRequest.PagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(audits.RowCount / (double)reportViewedAuditPagedRequest.PagedRequest.PageSize)
                };
            }
        }
    }
}
