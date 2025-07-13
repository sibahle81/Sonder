using RMA.Common.Extensions;

using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;


namespace RMA.Service.Admin.ScheduledTaskManager.Tasks
{
    /// <summary>
    /// Generic class to process work using multi threads whilst enabling thread limits
    /// </summary>
    /// <typeparam name="TId"></typeparam>
    public abstract class TaskConsumer<TId> : IDisposable
    {
        protected readonly BlockingCollection<TId> Entries;
        protected readonly SemaphoreSlim Sem;
        protected readonly string TaskName;
        private Task _monitorBlockingCollectionTask;
        private CancellationTokenSource _tokenSource;

        protected TaskConsumer(int nbrConcurrentTasks)
        {
            Entries = new BlockingCollection<TId>(nbrConcurrentTasks);
            NumberOfConcurrentTasks = nbrConcurrentTasks;
            Sem = new SemaphoreSlim(NumberOfConcurrentTasks, NumberOfConcurrentTasks);
        }

        protected TaskConsumer(int nbrConcurrentTasks, string name)
        {
            Entries = new BlockingCollection<TId>(nbrConcurrentTasks);
            TaskName = name;
            NumberOfConcurrentTasks = nbrConcurrentTasks;
            Sem = new SemaphoreSlim(NumberOfConcurrentTasks, NumberOfConcurrentTasks);
        }

        public virtual bool Ready => Entries.Count == 0 && Sem.CurrentCount > 0;

        public virtual int FreeThreads => Sem.CurrentCount;

        public int NumberOfConcurrentTasks { get; set; }

        #region IDisposable Members

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #endregion

        public virtual void Start()
        {
            try
            {
                _tokenSource = new CancellationTokenSource();
                _monitorBlockingCollectionTask = Task.Run(WaitForTasks, _tokenSource.Token);
            }
            catch (OperationCanceledException oce)
            {
                oce.LogException();
            }
        }

        public virtual void Stop()
        {
            if (_monitorBlockingCollectionTask == null)
            {
                return;
            }

            Entries.CompleteAdding();

            var count = 0;
            while (!Entries.IsCompleted || FreeThreads < NumberOfConcurrentTasks)
            {
                // wait for tasks to complete
                Thread.Sleep(5000); // Wait 5 seconds between checks - Arb Value
                count = count + 1;
                if (count >= 36)
                {
                    break;
                }
            }

            // wait for the loop state to stop
            count = 0;
            _tokenSource.Cancel();
            while (!_monitorBlockingCollectionTask.IsCanceled && _monitorBlockingCollectionTask.Status == TaskStatus.Running)
            {
                Thread.Sleep(5000); // Wait 5 seconds between checks - Arb Value
                if (count >= 36)
                {
                    break;
                }
            }
        }
        public virtual void Add(TId entry)
        {
            Entries.Add(entry);
        }

        ~TaskConsumer()
        {
            Dispose(false);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                Stop();

                _monitorBlockingCollectionTask.Dispose();
                _tokenSource.Dispose();
                _monitorBlockingCollectionTask = null;
            }
        }

        public abstract Task ExecuteTask(TId taskId);

        private void WaitForTasks()
        {
            // This using blocking collections which prevents endess looks on the Take method
            while (!Entries.IsCompleted)
            {
                var data = default(TId);
                var takeSuccess = false;
                try
                {
                    data = Entries.Take(); // blocking if there are no entries
                    takeSuccess = true;
                }
                catch (InvalidOperationException)
                {
                    //DoNothing
                }

                if (takeSuccess)
                {
                    Sem.Wait(); // blocking to prevent multiplie processing past max concurrent tasks
                    try
                    {
                        // Run the task on a new thread but no need to await it.
                        _ = Task.Run(async () =>
                              {
                                  // Isolate the errors to prevent the processor failing all together.
                                  try
                                  {
                                      await ExecuteTask(data);
                                  }
                                  catch (Exception ex)
                                  {
                                      ex.LogException();
                                  }
                              },
                            _tokenSource.Token)
                            .ContinueWith(task => Sem.Release());
                    }
                    catch (Exception ex)
                    {
                        ex.LogException();
                    }
                }
            }
        }
    }
}
