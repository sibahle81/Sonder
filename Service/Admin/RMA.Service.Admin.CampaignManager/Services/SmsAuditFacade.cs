using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Constants;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class SmsAuditFacade : RemotingStatelessService, ISmsAuditService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_SmsAudit> _smsAuditRepository;

        public SmsAuditFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_SmsAudit> smsAuditRepository
        ) : base(context) 
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _smsAuditRepository = smsAuditRepository;
        }

        public async Task<PagedRequestResult<SmsAudit>> GetPagedSmsAudits(int itemId, string itemType, PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = pagedRequest.SearchCriteria;
                var audits = new PagedRequestResult<SmsAudit>();

                if (String.IsNullOrWhiteSpace(filter))
                {
                    audits = await _smsAuditRepository
                        .AsNoTracking()
                        .Where(s => s.ItemType == itemType && s.ItemId == itemId)
                        .Select(s => new SmsAudit
                        {
                            Id = s.Id,
                            ItemType = s.ItemType,
                            ItemId = s.ItemId,
                            IsSuccess = s.IsSuccess,
                            SmsNumbers = s.SmsNumbers,
                            Message = s.Message,
                            ProcessDescription = s.ProcessDescription,
                            Department = s.Department,
                            IsActive = s.IsActive,
                            IsDeleted = s.IsDeleted,
                            CreatedBy = s.CreatedBy,
                            CreatedDate = s.CreatedDate,
                            ModifiedBy = s.ModifiedBy,
                            ModifiedDate = s.ModifiedDate,
                            SmsReference = s.SmsReference,
                            BusinessArea = s.BusinessArea
                        })
                        .ToPagedResult(pagedRequest);
                }
                else
                {
                    audits = await _smsAuditRepository
                        .AsNoTracking()
                        .Where(s => s.ItemType == itemType && s.ItemId == itemId && (s.SmsNumbers.Contains(filter) || s.Message.Contains(filter)))
                        .Select(s => new SmsAudit
                        {
                            Id = s.Id,
                            ItemType = s.ItemType,
                            ItemId = s.ItemId,
                            IsSuccess = s.IsSuccess,
                            SmsNumbers = s.SmsNumbers,
                            Message = s.Message,
                            ProcessDescription = s.ProcessDescription,
                            Department = s.Department,
                            IsActive = s.IsActive,
                            IsDeleted = s.IsDeleted,
                            CreatedBy = s.CreatedBy,
                            CreatedDate = s.CreatedDate,
                            ModifiedBy = s.ModifiedBy,
                            ModifiedDate = s.ModifiedDate,
                            SmsReference = s.SmsReference,
                            BusinessArea = s.BusinessArea
                        })
                        .ToPagedResult(pagedRequest);
                }

                return new PagedRequestResult<SmsAudit>()
                {
                    PageSize = audits.PageSize,
                    Page = audits.Page,
                    PageCount = audits.PageCount,
                    RowCount = audits.RowCount,
                    Data = audits.Data
                };
            }
        }

        public async Task<PagedRequestResult<SmsAudit>> GetSmsAuditForPolicy(int policyId, PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = String.IsNullOrWhiteSpace(pagedRequest.SearchCriteria)
                    ? "" : pagedRequest.SearchCriteria.Trim();

                // Use a stored procedure because the EmailAudit table also has to 
                // join on policy.Policy, claim.Claim, and claim.PersonEvent
                var list = await _smsAuditRepository.SqlQueryAsync<SmsAudit>(
                    DatabaseConstants.GetPolicySmsAudit,
                    new SqlParameter { ParameterName = "@policyId", Value = policyId },
                    new SqlParameter { ParameterName = "@filter", Value = filter }
                );

                // Calculate the startIndex and number of pages
                var startIndex = (pagedRequest.Page - 1) * pagedRequest.PageSize;
                var pages = (double)list.Count / pagedRequest.PageSize;

                // Check if the parameters exceed the available data
                if (list.Count == 0 || startIndex > list.Count)
                {
                    return new PagedRequestResult<SmsAudit>
                    {
                        Data = new List<SmsAudit>(),
                        RowCount = list.Count,
                        PageCount = (int)Math.Ceiling(pages),
                        PageSize = pagedRequest.PageSize,
                        Page = pagedRequest.Page
                    };
                }

                // Filter the messages
                var messages = list
                    .GetRange(startIndex, Math.Min(pagedRequest.PageSize, list.Count))
                    .OrderByDescending(s => s.Id)
                    .ToList();

                // Create the result set
                return new PagedRequestResult<SmsAudit>
                {
                    Data = messages,
                    RowCount = list.Count,
                    PageCount = (int)Math.Ceiling(pages),
                    PageSize = pagedRequest.PageSize,
                    Page = pagedRequest.Page
                };
            }
        }
    }
}
