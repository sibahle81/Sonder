using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;
using RMA.Service.Billing.Database.Constants;

namespace RMA.Service.Billing.Services
{
    public class InterestFacade : RemotingStatelessService, IInterestService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<billing_Interest> _interestRepository;
        private readonly IUserReminderService _userReminderService;

        public InterestFacade(
           StatelessServiceContext context,
           IDbContextScopeFactory dbContextScopeFactory,
           IRepository<billing_Interest> interestRepository,
           IUserReminderService userReminderService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _interestRepository = interestRepository;
            _userReminderService = userReminderService;
        }

        public async Task<bool> StartInterestCalculation(InterestCalculationRequest interestCalculationRequest)
        {
            Contract.Requires(interestCalculationRequest != null);

            #region create start notification
            var processStartTime = DateTimeHelper.SaNow;

            var userReminder = new UserReminder
            {
                AssignedToUserId = RmaIdentity.UserId,
                UserReminderType = UserReminderTypeEnum.SystemNotification,
                Text = $"Generate Interest process started for {interestCalculationRequest.IndustryClass} :{interestCalculationRequest.ProductCategoryId} :{interestCalculationRequest.PeriodId} process was started at {processStartTime} by {RmaIdentity.DisplayName} ({RmaIdentity.Email})",
                AlertDateTime = DateTimeHelper.SaNow,
                CreatedBy = "Start Interest Calculation Process"
            };

            _ = Task.Run(() => _userReminderService.CreateUserReminder(userReminder));
            #endregion

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _interestRepository.ExecuteSqlCommandAsync(DatabaseConstants.RaiseInterestForUnpaidInvoices
                         , new SqlParameter("@periodId",
                         interestCalculationRequest.PeriodId.HasValue ? interestCalculationRequest.PeriodId.Value : (object)DBNull.Value)
                         , new SqlParameter("@industryClassId",
                         interestCalculationRequest.IndustryClass.HasValue ? interestCalculationRequest.IndustryClass.Value : (object)DBNull.Value)
                         , new SqlParameter("@productCategoryId",
                         interestCalculationRequest.ProductCategoryId.HasValue ? interestCalculationRequest.ProductCategoryId.Value : (object)DBNull.Value)
                         );
            }

            #region create close notification
            var processEndTime = DateTimeHelper.SaNow;

            TimeSpan processDuration = (processEndTime - processStartTime);
            var duration = string.Format("{0:%d} days, {0:%h} hours, {0:%m} minutes, {0:%s} seconds", processDuration);

            var completedUserReminder = new UserReminder
            {
                AssignedToUserId = RmaIdentity.UserId,
                UserReminderType = UserReminderTypeEnum.SystemNotification,
                Text = $"Generate Interest process completed for {interestCalculationRequest.IndustryClass} :{interestCalculationRequest.ProductCategoryId} :{interestCalculationRequest.PeriodId}, This process took: {duration} to execute",
                AlertDateTime = DateTimeHelper.SaNow,
                CreatedBy = "Start Interest Calculation Process"
            };

            _ = Task.Run(() => _userReminderService.CreateUserReminder(completedUserReminder));
            #endregion

            return true;

        }

        public async Task<bool> ProcessInterestCalculation(InterestCalculationRequest interestCalculationRequest)
        {
            Contract.Requires(interestCalculationRequest != null);

            #region create start notification
            var processStartTime = DateTimeHelper.SaNow;

            var userReminder = new UserReminder
            {
                AssignedToUserId = RmaIdentity.UserId,
                UserReminderType = UserReminderTypeEnum.SystemNotification,
                Text = $"Process Interest process started for {interestCalculationRequest.IndustryClass} :{interestCalculationRequest.ProductCategoryId} :{interestCalculationRequest.PeriodId} process was started at {processStartTime} by {RmaIdentity.DisplayName} ({RmaIdentity.Email})",
                AlertDateTime = DateTimeHelper.SaNow,
                CreatedBy = "Process Interest Calculation Process"
            };

            _ = Task.Run(() => _userReminderService.CreateUserReminder(userReminder));
            #endregion

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _interestRepository.ExecuteSqlCommandAsync(DatabaseConstants.CommitStagedInterest
                         , new SqlParameter("@periodId",
                         interestCalculationRequest.PeriodId.HasValue ? interestCalculationRequest.PeriodId.Value : (object)DBNull.Value)
                         , new SqlParameter("@industryClassId",
                         interestCalculationRequest.IndustryClass.HasValue ? interestCalculationRequest.IndustryClass.Value : (object)DBNull.Value)
                         , new SqlParameter("@productCategoryId",
                         interestCalculationRequest.ProductCategoryId.HasValue ? interestCalculationRequest.ProductCategoryId.Value : (object)DBNull.Value)
                         );
            }

            #region create close notification
            var processEndTime = DateTimeHelper.SaNow;

            TimeSpan processDuration = (processEndTime - processStartTime);
            var duration = string.Format("{0:%d} days, {0:%h} hours, {0:%m} minutes, {0:%s} seconds", processDuration);

            var completedUserReminder = new UserReminder
            {
                AssignedToUserId = RmaIdentity.UserId,
                UserReminderType = UserReminderTypeEnum.SystemNotification,
                Text = $"Process Interest process completed for {interestCalculationRequest.IndustryClass} :{interestCalculationRequest.ProductCategoryId} :{interestCalculationRequest.PeriodId}, This process took: {duration} to execute",
                AlertDateTime = DateTimeHelper.SaNow,
                CreatedBy = "Process Interest Calculation Process"
            };

            _ = Task.Run(() => _userReminderService.CreateUserReminder(completedUserReminder));
            #endregion

            return true;
        }

        public async Task<PagedRequestResult<Interest>> GetPagedCalculatedInterest(InterestSearchRequest interestSearchRequest)
        {
            Contract.Requires(interestSearchRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                _interestRepository.DisableFilter("SoftDeletes");

                var query = _interestRepository.AsQueryable();

                if (interestSearchRequest.IndustryClass.HasValue)
                {
                    var industryClass = interestSearchRequest.IndustryClass.Value;
                    query = query.Where(r => r.IndustryClass == industryClass);
                }

                if (interestSearchRequest.PeriodId.HasValue)
                {
                    var periodId = interestSearchRequest.PeriodId.Value;
                    query = query.Where(r => r.PeriodId == periodId);
                }

                if (interestSearchRequest.RolePlayerId.HasValue)
                {
                    var rolePlayerId = interestSearchRequest.RolePlayerId.Value;
                    query = query.Where(r => r.RolePlayerId == rolePlayerId);
                }               

                if (interestSearchRequest.ProductCategoryId.HasValue)
                {
                    var productCategoryId = interestSearchRequest.ProductCategoryId.Value;
                    query = query.Where(r => r.ProductCategoryId == productCategoryId);
                }

                if (interestSearchRequest.InterestStatus.HasValue)
                {
                    var interestStatus = interestSearchRequest.InterestStatus.Value;
                    query = query.Where(r => r.InterestStatus == interestStatus);
                }

                var results = await query.ToPagedResult(interestSearchRequest.PagedRequest);

                _interestRepository.EnableFilter("SoftDeletes");

                var data = Mapper.Map<List<Interest>>(results.Data);

                return new PagedRequestResult<Interest>
                {
                    Page = interestSearchRequest.PagedRequest.Page,
                    PageCount = (int)Math.Ceiling(results.RowCount / (double)interestSearchRequest.PagedRequest.PageSize),
                    RowCount = results.RowCount,
                    PageSize = interestSearchRequest.PagedRequest.PageSize,
                    Data = data
                };
            }
        }

        public async Task<bool> UpdateCalculatedInterest(List<Interest> interests)
        {
            Contract.Requires(interests != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                _interestRepository.DisableFilter("SoftDeletes");
                var entities = new List<billing_Interest>();

                foreach (var interest in interests)
                {
                    var entity = await _interestRepository.FirstOrDefaultAsync(s => s.InterestId == interest.InterestId);

                    if (entity == null) { continue; }

                    entity.AdjustedInterestAmount = interest.AdjustedInterestAmount;
                    entity.Comment = interest.Comment;
                    entity.IsDeleted = interest.IsDeleted;
                    entity.InterestStatus = interest.InterestStatus;

                    entities.Add(entity);
                }

                if (entities.Count > 0)
                {
                    _interestRepository.Update(entities);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
                _interestRepository.EnableFilter("SoftDeletes");

                return true;
            }
        }
    }
}
