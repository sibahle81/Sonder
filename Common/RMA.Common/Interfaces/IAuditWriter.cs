using System;
using System.Threading.Tasks;

namespace RMA.Common.Interfaces
{
    public interface IAuditWriter
    {
        Task AddAudit<TEntity>(int id, string action, string oldItem, string newItem);
        Task AddAudit(int id, Type itemType, string action, string oldItem, string newItem);
        Task AddLastViewed<TEntity>(int id);
        Task AddLastViewed(int id, Type itemType);
    }
}
