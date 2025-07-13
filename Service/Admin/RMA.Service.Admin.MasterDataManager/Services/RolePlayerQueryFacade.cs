using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class RolePlayerQueryFacade : RemotingStatelessService, IRolePlayerQueryService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_RolePlayerItemQuery> _rolePlayerItemQueryRepository;
        private readonly IRepository<common_RolePlayerItemQueryItem> _rolePlayerItemQueryItemRepository;
        private readonly IRepository<common_RolePlayerItemQueryResponse> _rolePlayerItemQueryResponseRepository;
        private readonly IMapper _mapper;

        public RolePlayerQueryFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_RolePlayerItemQuery> rolePlayerItemQueryRepository,
            IRepository<common_RolePlayerItemQueryItem> rolePlayerItemQueryItemRepository,
            IRepository<common_RolePlayerItemQueryResponse> rolePlayerItemQueryResponseRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _rolePlayerItemQueryRepository = rolePlayerItemQueryRepository;
            _rolePlayerItemQueryItemRepository = rolePlayerItemQueryItemRepository;
            _rolePlayerItemQueryResponseRepository = rolePlayerItemQueryResponseRepository;
            _mapper = mapper;
        }

        public async Task<RolePlayerItemQuery> AddRolePlayerItemQuery(RolePlayerItemQuery rolePlayerItemQuery)
        {
            Contract.Requires(rolePlayerItemQuery != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_RolePlayerItemQuery>(rolePlayerItemQuery);

                _rolePlayerItemQueryRepository.Create(entity);
                rolePlayerItemQuery.Id = await scope.SaveChangesAsync().ConfigureAwait(false);

                return _mapper.Map<RolePlayerItemQuery>(entity);
            }
        }

        public async Task<int> UpdateRolePlayerItemQuery(RolePlayerItemQuery rolePlayerItemQuery)
        {
            Contract.Requires(rolePlayerItemQuery != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_RolePlayerItemQuery>(rolePlayerItemQuery);

                _rolePlayerItemQueryRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task<RolePlayerItemQuery> GetRolePlayerItemQueryById(int rolePlayerItemQueryId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _rolePlayerItemQueryRepository.Where(x => x.Id == rolePlayerItemQueryId).FirstOrDefaultAsync();

                return _mapper.Map<RolePlayerItemQuery>(entity);
            }
        }

        public async Task<PagedRequestResult<RolePlayerItemQuery>> GetPagedRolePlayerItemQueries(RolePlayerQueryItemTypeEnum rolePlayerQueryItemType, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var itemId = Convert.ToInt32(pagedRequest.SearchCriteria);

                var queries = await (from q in _rolePlayerItemQueryItemRepository
                                     join r in _rolePlayerItemQueryRepository on q.RolePlayerItemQueryId equals r.Id
                                     where q.ItemId == itemId && r.RolePlayerQueryItemType == rolePlayerQueryItemType
                                     select new RolePlayerItemQuery
                                     {
                                         Id = r.Id,
                                         QueryReferenceNumber = r.QueryReferenceNumber,
                                         RolePlayerId = r.RolePlayerId,
                                         RolePlayerItemQueryType = r.RolePlayerItemQueryType,
                                         RolePlayerQueryItemType = r.RolePlayerQueryItemType,
                                         RolePlayerItemQueryCategory = r.RolePlayerItemQueryCategory,
                                         RolePlayerItemQueryStatus = r.RolePlayerItemQueryStatus,
                                         QueryDescription = r.QueryDescription,
                                         CreatedBy = r.CreatedBy,
                                         CreatedDate = r.CreatedDate
                                     }).ToPagedResult(pagedRequest);

                var mappedQueries = _mapper.Map<List<common_RolePlayerItemQuery>>(queries.Data);
                await _rolePlayerItemQueryRepository.LoadAsync(mappedQueries, t => t.RolePlayerItemQueryItems);
                await _rolePlayerItemQueryRepository.LoadAsync(mappedQueries, t => t.RolePlayerItemQueryResponses);

                var data = _mapper.Map<List<RolePlayerItemQuery>>(mappedQueries);

                return new PagedRequestResult<RolePlayerItemQuery>
                {
                    Data = data,
                    RowCount = queries.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(queries.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<int> AddRolePlayerItemQueryResponse(RolePlayerItemQueryResponse rolePlayerItemQueryResponse)
        {
            Contract.Requires(rolePlayerItemQueryResponse != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_RolePlayerItemQueryResponse>(rolePlayerItemQueryResponse);

                _rolePlayerItemQueryResponseRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task<PagedRequestResult<RolePlayerItemQueryResponse>> GetPagedRolePlayerItemQueryResponses(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var rolePlayerItemQueryId = Convert.ToInt32(pagedRequest.SearchCriteria);

                var responses = await _rolePlayerItemQueryResponseRepository.Where(x => x.RolePlayerItemQueryId == rolePlayerItemQueryId)
                                .ToPagedResult(pagedRequest);

                var data = _mapper.Map<List<RolePlayerItemQueryResponse>>(responses);

                return new PagedRequestResult<RolePlayerItemQueryResponse>
                {
                    Data = data,
                    RowCount = responses.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(responses.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }
    }
}
