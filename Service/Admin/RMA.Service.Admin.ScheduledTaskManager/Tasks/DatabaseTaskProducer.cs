using CommonServiceLocator;

using Microsoft.Extensions.Logging;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Service.Admin.ScheduledTaskManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using ILogger = Microsoft.Extensions.Logging.ILogger;
using Timer = System.Timers.Timer;

namespace RMA.Service.Admin.ScheduledTaskManager.Tasks
{
    internal sealed class DatabaseTaskProducer : IDisposable
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly string _hostName;
        private readonly Timer _timer;
        private bool _disposed;
        private ILogger Logger { get; }

        //prevents aborts during the processing of a message
        private ManualResetEvent ProcessingMessage { get; } = new ManualResetEvent(true);

        public DatabaseTaskProducer(int polInterval, string hostName)
        {
            _hostName = hostName;
            _timer = new Timer(TimeSpan.FromSeconds(polInterval).TotalMilliseconds);
            _dbContextScopeFactory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();

            Logger = new LoggerFactory().CreateLogger(GetType());
        }

        #region IDisposable Members

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #endregion

        ~DatabaseTaskProducer()
        {
            Dispose(false);
        }

        public event EventHandler BatchAvailable;

        public void Start()
        {
            _timer.Elapsed += SchedulerTimer_Tick;
            _timer.Start();
            SchedulerTimer_Tick(null, EventArgs.Empty);
        }

        public void Stop()
        {
            ProcessingMessage.WaitOne();
            ProcessingMessage.Dispose();
            _timer.Stop();
            _timer.Elapsed -= SchedulerTimer_Tick;
        }

        internal async Task<List<int>> FetchAndAddTasksFromDatabase(int numberOfTasksToCollect)
        {
            try
            {
                ProcessingMessage.Reset();

                using (var scope = _dbContextScopeFactory.Create())
                {
                    Logger.Log(LogLevel.Debug, "Fetching {0} tasks from the database", numberOfTasksToCollect);

                    var taskRepo = ServiceLocator.Current.GetInstance<IRepository<scheduledTask_ScheduledTask>>();
                    var tasksToExecute = await taskRepo
                        .Where(t => t.HostName == null && t.ScheduledTaskType.IsEnabled
                                    && t.NumberOfRetriesRemaining > 0
                                    && t.ScheduledDate < DateTimeHelper.SaNow)
                        .OrderBy(t => t.Priority)
                        .Take(numberOfTasksToCollect)
                        .ToListAsync()
                        .ConfigureAwait(false);

                    foreach (var scheduledTask in tasksToExecute)
                    {
                        scheduledTask.HostName = _hostName;
                        scheduledTask.DateTimeLockedToHost = DateTime.Now;
                    }

                    taskRepo.Update(tasksToExecute);

                    Logger.Log(LogLevel.Debug, "{0} tasks collected for execution", tasksToExecute.Count);

                    var items = tasksToExecute.Select(s => s.ScheduledTaskId).ToList();
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return items;
                }
            }
            finally
            {
                ProcessingMessage.Set();
            }
        }

        private void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_disposed)
                {
                    return;
                }

                Stop();
                _timer.Dispose();
                _disposed = true;
            }
        }

        private void SchedulerTimer_Tick(object sender, EventArgs e)
        {
            // Copy Local For Thread Safety
            var batchAvailable = BatchAvailable;

            if (batchAvailable != null)
            {
                batchAvailable(sender, e);
            }
        }
    }
}
