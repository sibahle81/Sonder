using CommonServiceLocator;

using Microsoft.Extensions.Logging;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.SDK;
using RMA.Service.Admin.ScheduledTaskManager.Database.Entities;

using System;
using System.Data.Entity;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.ScheduledTaskManager.Tasks
{
    /// <summary>
    ///     The purpose of this class is to consume database tasks and to process then in parallel.
    ///     this class is configured to process _nbrConcurrentTasks using the TPL
    /// </summary>
    internal sealed class DatabaseTaskConsumer : TaskConsumer<int>
    {
        private readonly string _hostName;
        private ILogger Logger { get; }
        public DatabaseTaskConsumer(int nbrConcurrentTasks, string hostName)
            : base(nbrConcurrentTasks)
        {
            _hostName = hostName;
            Logger = new LoggerFactory().CreateLogger(GetType());
        }

        public override async Task ExecuteTask(int scheduledTaskId)
        {
            try
            {
                var stopWatch = new Stopwatch();
                stopWatch.Start();

                var scheduledTaskRepository = ServiceLocator.Current.GetInstance<IRepository<scheduledTask_ScheduledTask>>();
                var dbContextScopeFactory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                using (var scope = dbContextScopeFactory.Create())
                {
                    var details = await scheduledTaskRepository
                        .Include(sc => sc.ScheduledTaskType)
                        .SingleOrDefaultAsync(sc => sc.ScheduledTaskId == scheduledTaskId);

                    if (details != null)
                    {
                        try
                        {
                            Logger.Log(LogLevel.Debug, "Task Host:{0} Executing Task {1}-{2}", _hostName, scheduledTaskId, details.ScheduledTaskType);

                            var handler = GetTaskHandler(details.ScheduledTaskType.TaskHandler);

                            bool success;
                            Exception processException = null;
                            try
                            {
                                Logger.Log(LogLevel.Debug, "Task Host:{0} Executing Task {1}-{2} START", _hostName, scheduledTaskId, details.ScheduledTaskType);
                                success = await handler.ExecuteTask(details.ScheduledTaskId);
                                Logger.Log(LogLevel.Debug, "Task Host:{0} Executing Task {1}-{2} COMPLETE", _hostName, scheduledTaskId, details.ScheduledTaskType);
                            }
                            catch (Exception ex)
                            {
                                Logger.Log(LogLevel.Debug, "Task Host:{0} error executing task (1) {1}-{2}", _hostName, scheduledTaskId, details.ScheduledTaskType);
                                ex.LogException();
                                processException = ex;
                                success = false;
                            }

                            stopWatch.Stop();
                            var executionDuration = stopWatch.Elapsed;

                            if (handler.CanCompleteTask)
                            {
                                await handler.CompleteTask(details.ScheduledTaskId, success, details.TaskScheduleFrequency, executionDuration);
                            }

                            Logger.Log(LogLevel.Debug, $"Task Host:{0} Executing Task {1}-{2} COMPLETE TASK", _hostName, scheduledTaskId, details.ScheduledTaskType);
                            await CompleteTask(scheduledTaskRepository, details, success, executionDuration, handler, processException);
                            Logger.Log(LogLevel.Debug, "Task Host:{0} Executing Task {1}-{2} COMPLETE TASK DONE", _hostName, scheduledTaskId, details.ScheduledTaskType);
                            Logger.Log(LogLevel.Debug, $"Task Host:{_hostName} Execution Complete ({(success ? "Successful" : "Error")}) {scheduledTaskId}-{details.TaskScheduleFrequency}, duration {executionDuration.Seconds} seconds");
                        }
                        catch (Exception e)
                        {
                            e.LogException();
                            stopWatch.Stop();
                            var executionDuration = stopWatch.Elapsed;
                            FailTask(scheduledTaskRepository, details, executionDuration, e);
                        }

                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Log(LogLevel.Debug, "Task Host:{0} error executing task (2) {1}", _hostName, scheduledTaskId);
                ex.LogException();
            }
        }

        private static void UpdateScheduledDate(scheduledTask_ScheduledTask details)
        {
            switch (details.TaskScheduleFrequency)
            {
                case TaskScheduleFrequencyEnum.Hourly:
                    //stack overflow is has not run in the last x days
                    double minDifference60 = ((DateTime.Now - details.ScheduledDate).TotalMinutes) / 60;
                    var adjustment60 = Math.Floor(minDifference60) * 60;
                    if (Math.Abs(adjustment60) < 1) adjustment60 = 60;
                    details.ScheduledDate = details.ScheduledDate.AddMinutes(adjustment60);
                    break;
                case TaskScheduleFrequencyEnum.Daily:
                    details.ScheduledDate = details.ScheduledDate.AddDays(1);
                    break;
                case TaskScheduleFrequencyEnum.Weekly:
                    details.ScheduledDate = details.ScheduledDate.AddDays(7);
                    break;
                case TaskScheduleFrequencyEnum.Monthly:
                    details.ScheduledDate = details.ScheduledDate.AddMonths(1);
                    break;
                case TaskScheduleFrequencyEnum.Quarterly:
                    details.ScheduledDate = details.ScheduledDate.AddMonths(4);
                    break;
                case TaskScheduleFrequencyEnum.BiYearly:
                    details.ScheduledDate = details.ScheduledDate.AddMonths(6);
                    break;
                case TaskScheduleFrequencyEnum.Yearly:
                    details.ScheduledDate = details.ScheduledDate.AddYears(1);
                    break;
                case TaskScheduleFrequencyEnum.OneMinutes:
                    //stack overflow is has not run in the last x days
                    double minDifference1 = ((DateTime.Now - details.ScheduledDate).TotalMinutes) / 1;
                    var adjustment1 = Math.Floor(minDifference1) * 1;
                    if (Math.Abs(adjustment1) < 1) adjustment1 = 1;
                    details.ScheduledDate = details.ScheduledDate.AddMinutes(adjustment1);
                    break;
                case TaskScheduleFrequencyEnum.TwoMinutes:
                    //stack overflow is has not run in the last x days
                    double minDifference2 = ((DateTime.Now - details.ScheduledDate).TotalMinutes) / 2;
                    var adjustment2 = Math.Floor(minDifference2) * 2;
                    if (Math.Abs(adjustment2) < 1) adjustment2 = 2;
                    details.ScheduledDate = details.ScheduledDate.AddMinutes(adjustment2);
                    break;
                case TaskScheduleFrequencyEnum.FiveMinutes:
                    //stack overflow is has not run in the last x days
                    double minDifference5 = ((DateTime.Now - details.ScheduledDate).TotalMinutes) / 5;
                    var adjustment5 = Math.Floor(minDifference5) * 5;
                    if (Math.Abs(adjustment5) < 1) adjustment5 = 5;
                    details.ScheduledDate = details.ScheduledDate.AddMinutes(adjustment5);
                    break;
                case TaskScheduleFrequencyEnum.QuarterHourly:
                    //stack overflow is has not run in the last x days
                    double minDifference = ((DateTime.Now - details.ScheduledDate).TotalMinutes) / 15;
                    var adjustment = Math.Floor(minDifference) * 15;
                    if (Math.Abs(adjustment) < 1) adjustment = 15;
                    details.ScheduledDate = details.ScheduledDate.AddMinutes(adjustment);
                    break;
                case TaskScheduleFrequencyEnum.HalfHourly:
                    //stack overflow is has not run in the last x days
                    double minDifferenceH = ((DateTime.Now - details.ScheduledDate).TotalMinutes) / 30;
                    var adjustmentH = Math.Floor(minDifferenceH) * 30;
                    if (Math.Abs(adjustmentH) < 1) adjustmentH = 30;
                    details.ScheduledDate = details.ScheduledDate.AddMinutes(adjustmentH);
                    break;
            }

            if (details.ScheduledDate < DateTime.Now)
            {
                UpdateScheduledDate(details);
            }
        }

        private static IScheduledTaskHandler GetTaskHandler(string taskHandler)
        {
            var handlerType = Type.GetType(taskHandler);
            if (handlerType == null || handlerType.GetInterfaces().All(i => i != typeof(IScheduledTaskHandler)))
            {
                throw new ActivationException("Task Handler for database type '" + taskHandler +
                                              "' is not found or does not implement interface IScheduledTaskHandler");
            }

            return (IScheduledTaskHandler)ServiceLocator.Current.GetInstance(handlerType);
        }

        private async Task CompleteTask(IRepository<scheduledTask_ScheduledTask> scheduledTaskRepository, scheduledTask_ScheduledTask details,
            bool success, TimeSpan executionDuration, IScheduledTaskHandler handler, Exception processException)
        {
            if (success)
            {
                Logger.Log(LogLevel.Debug, "Task Host: Executing CompleteTask - Success");
                if (details.TaskScheduleFrequency == TaskScheduleFrequencyEnum.OnceOff)
                {
                    if (handler != null)
                    {
                        Logger.Log(LogLevel.Debug, "Task Host: Executing CompleteTask - Delete");
                        await handler.DeleteTask(details.ScheduledTaskId);
                        Logger.Log(LogLevel.Debug, "Task Host: Executing CompleteTask - Delete DONE");
                    }

                    // in-case the handler did not delete the task too
                    Logger.Log(LogLevel.Debug, "Task Host: Executing CompleteTask - Delete OTHER QUERY");
                    var task = await scheduledTaskRepository.FirstOrDefaultAsync(s =>
                        s.ScheduledTaskId == details.ScheduledTaskId);
                    if (task != null)
                    {
                        //  LoggingService.Log(LogCategory.DatabaseTaskProcessor, LogLevel.Info, "Task Host: Executing CompleteTask - Delete OTHER");
                        scheduledTaskRepository.Delete(task);
                        Logger.Log(LogLevel.Debug, "Task Host: Executing CompleteTask - Delete OTHER DONE");
                    }
                }
                else
                {
                    Logger.Log(LogLevel.Debug, "Task Host: Executing CompleteTask - UPDATE");
                    UpdateScheduledDate(details);
                    details.LastRun = DateTime.Now;
                    details.LastRunDurationSeconds = (int)executionDuration.TotalSeconds;
                    details.LastStatus = "Success";
                    details.LastReason = null;
                    details.HostName = null; // Allows For Re-Scheduling
                    details.DateTimeLockedToHost = null;

                    scheduledTaskRepository.Update(details);
                }
            }
            else
            {
                FailTask(scheduledTaskRepository, details, executionDuration, processException);
            }
        }

        private void FailTask(IRepository<scheduledTask_ScheduledTask> scheduledTaskRepository,
            scheduledTask_ScheduledTask details,
           TimeSpan executionDuration, Exception processException)
        {
            details.LastRun = DateTime.Now;
            details.LastRunDurationSeconds = executionDuration.Seconds;
            details.LastStatus = "Error";
            details.HostName = null; // Allows For Re-Scheduling
            details.DateTimeLockedToHost = null;
            details.NumberOfRetriesRemaining = details.NumberOfRetriesRemaining - 1;
            details.LastReason = processException != null ? processException.Message : null;
            scheduledTaskRepository.Update(details);
        }
    }

}

