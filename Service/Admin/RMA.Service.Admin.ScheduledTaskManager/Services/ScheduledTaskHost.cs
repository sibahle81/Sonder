using CommonServiceLocator;

using Microsoft.Extensions.Logging;
using Microsoft.ServiceFabric.Services.Runtime;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.Diagnostics.Serilog;
using RMA.Service.Admin.ScheduledTaskManager.Contracts.Interfaces;
using RMA.Service.Admin.ScheduledTaskManager.Database.Entities;
using RMA.Service.Admin.ScheduledTaskManager.Tasks;

using Serilog;

using System;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using ILogger = Microsoft.Extensions.Logging.ILogger;

namespace RMA.Service.Admin.ScheduledTaskManager.Services
{
    public class ScheduledTaskHost : StatelessService, IScheduledTaskHost, IDisposable
    {
        private DatabaseTaskConsumer _consumer;
        private DatabaseTaskProducer _producer;
        private int _nbrConcurrentTasks = 8;
        private int _polInterval = 15; //seconds
        private string _hostName = Environment.MachineName;
        private bool _disposed;
        protected ILogger Logger { get; }

        public ScheduledTaskHost(StatelessServiceContext context)
            : base(context)
        {
            Logger = new LoggerFactory()
                .AddSerilog(Log.Logger.ForContext(new ServiceFabricEnricher(context)))
                .CreateLogger(GetType());
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            await ResetLockedDatabaseTasks();
            _producer = new DatabaseTaskProducer(_polInterval, _hostName);
            _consumer = new DatabaseTaskConsumer(_nbrConcurrentTasks, _hostName);
            _producer.BatchAvailable += (s, e) => ProducerOnBatchAvailable();
            Start();
        }

        protected override Task OnCloseAsync(CancellationToken cancellationToken)
        {
            Stop();
            return base.OnCloseAsync(cancellationToken);
        }

        private async Task ResetLockedDatabaseTasks()
        {
            try
            {
                // Reset tasks that are in progress or have failed when the service starts up.
                var dbContextScopeFactory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                using (var scope = dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    var taskRepo = ServiceLocator.Current.GetInstance<IRepository<scheduledTask_ScheduledTask>>();
                    var failedTasks = await taskRepo
                        .Where(t => t.HostName == _hostName || t.NumberOfRetriesRemaining == 0 && t.LastStatus == "Error")
                        .ToListAsync();

                    foreach (var scheduledTask in failedTasks)
                    {
                        scheduledTask.HostName = null;
                        scheduledTask.DateTimeLockedToHost = null;
                        if (scheduledTask.NumberOfRetriesRemaining == 0)
                        {
                            scheduledTask.NumberOfRetriesRemaining = 1;
                        }

                        taskRepo.Update(scheduledTask);
                    }

                    await scope.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        private void ProducerOnBatchAvailable()
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    // Check if the consumer is ready to accept more tasks
                    if (!_consumer.Ready)
                    {
                        // Consumer Queue is Full
                        return;
                    }

                    var tasksToFetch = _consumer.FreeThreads;
                    if (_consumer.FreeThreads > 0)
                    {
                        if (Environment.GetEnvironmentVariable("EnvName") != "Local.")
                        {
                            // Fetch more tasks from the producer
                            var newTasks = await _producer.FetchAndAddTasksFromDatabase(tasksToFetch);

                            // Add the new tasks to the consumer blocking collection (Process tasks concurrently)
                            if (newTasks != null && newTasks.Count > 0)
                            {
                                newTasks.ForEach(_consumer.Add);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            });
        }

        #region ITaskHost Members

        public void Start()
        {
            _producer.Start();
            _consumer.Start();
        }

        public void Stop()
        {
            _producer.Stop();
            _consumer.Stop();
        }

        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_disposed)
                {
                    return;
                }

                Stop();
                _producer.Dispose();
                _consumer.Dispose();
                _disposed = true;
            }
        }

        ~ScheduledTaskHost()
        {
            Dispose(false);
        }

        #endregion
    }
}
