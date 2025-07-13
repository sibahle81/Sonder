using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Utils
{
    public static class EnumerableHelper
    {
        public static void SingleForEach<T>(this IEnumerable<T> collection, Action<T> action)
        {
            foreach (var item in collection)
            {
                action(item);
            }
        }

        // Double iteration -- both collections are iterated over 
        // and are assumed to be of equal length
        public static void DoubleForEach<T, U>(
            this IEnumerable<T> collection1,
            IList<U> collection2,
            Func<T, U,
            bool> where,
            Action<T, U> action)
        {
            int n = 0;

            foreach (var item in collection1)
            {
                U v2 = collection2[n++];

                if (where(item, v2))
                {
                    action(item, v2);
                }
            }
        }
    }
}
