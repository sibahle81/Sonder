using System;
using System.Threading.Tasks;

namespace RMA.Service.Admin.ScheduledTaskManager.Tasks
{
    /// <summary>
    /// Generic action delegate task consumer, using base multi threading
    /// </summary>
    /// <typeparam name="TId"></typeparam>
    public class ActionTaskConsumer<TId> : TaskConsumer<TId>
    {
        private readonly Func<TId, Task> _processAction;

        public ActionTaskConsumer(int nbrConcurrentTasks
            , Func<TId, Task> processAction)
            : base(nbrConcurrentTasks)
        {
            _processAction = processAction;
        }

        public ActionTaskConsumer(int nbrConcurrentTasks, string name)
            : base(nbrConcurrentTasks, name)
        {
        }

        public override async Task ExecuteTask(TId message)
        {
            await _processAction(message);
        }
    }
}
