using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class WorkpoolUserScheduleFacade : RemotingStatelessService, IWorkpoolUserScheduleService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_MonthlyScheduledWorkPoolUser> _monthlyScheduledWorkPoolUsersRepository;
        private readonly IMapper _mapper;

        public WorkpoolUserScheduleFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_MonthlyScheduledWorkPoolUser> monthlyScheduledWorkPoolUsersRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _monthlyScheduledWorkPoolUsersRepository = monthlyScheduledWorkPoolUsersRepository;
            _mapper = mapper;
        }

        public async Task<bool> AddMonthlyScheduleWorkpoolUser(List<MonthlyScheduledWorkPoolUser> monthlyScheduledWorkPoolUsers)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                _monthlyScheduledWorkPoolUsersRepository.Create(_mapper.Map<List<common_MonthlyScheduledWorkPoolUser>>(monthlyScheduledWorkPoolUsers));
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<PagedRequestResult<MonthlyScheduledWorkPoolUser>> GetMonthlyScheduleWorkpoolUser(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var scheduleWorkpoolUser = await _monthlyScheduledWorkPoolUsersRepository.Select(x => new MonthlyScheduledWorkPoolUser
                {
                    CreatedDate = x.CreatedDate,
                    CreatedBy = x.CreatedBy,
                    ModifiedBy = x.ModifiedBy,
                    ModifiedDate = x.ModifiedDate,
                    WorkPool = x.WorkPool,
                    AssignedByUserId = x.AssignedByUserId,
                    AssignedToUserId = x.AssignedToUserId
                }).ToPagedResult(request);

                return new PagedRequestResult<MonthlyScheduledWorkPoolUser>()
                {
                    PageSize = scheduleWorkpoolUser.PageSize,
                    Page = scheduleWorkpoolUser.Page,
                    PageCount = scheduleWorkpoolUser.PageCount,
                    RowCount = scheduleWorkpoolUser.RowCount,
                    Data = scheduleWorkpoolUser.Data
                };
            }
        }
    }
}
