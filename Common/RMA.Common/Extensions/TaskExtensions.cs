using System;
using System.Threading.Tasks;

namespace RMA.Common.Extensions
{
    public static class AsyncHelpers
    {
        public static void RunTaskSynchronously(this Task t)
        {
            var task = Task.Run(async () =>
            {
                try
                {
                    await t;
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            });

            task.Wait();
        }

        public static T RunTaskSynchronously<T>(this Task<T> t)
        {
            var res = default(T);
            var task = Task.Run(async () =>
            {
                try
                {
                    res = await t;
                }
                catch (Exception ex)
                {
                    ex.LogException();
                }
            });
            task.Wait();
            return res;
        }
    }
}