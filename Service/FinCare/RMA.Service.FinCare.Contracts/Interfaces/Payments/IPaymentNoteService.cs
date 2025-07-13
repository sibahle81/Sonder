using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Contracts.Interfaces.Payments
{
    public interface IPaymentNoteService : IService
    {
        Task<Note> GetNote(int id);
        Task<int> AddNote(Note noteModel);
        Task EditNote(Note noteModel);
        Task<List<Note>> GetNotes(int paymentId);
        Task<PagedRequestResult<Note>> GetPagedPolicyNotes(PagedRequest pagedRequest);
    }
}
