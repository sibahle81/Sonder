using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.ClaimCare.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Event
{
    public interface INoteService : IService
    {
        Task<EventNote> GetNote(int id);
        Task<int> AddNote(EventNote noteModel);
        Task EditNote(EventNote noteModel);
        Task<List<EventNote>> GetNotes(int eventId);
    }
}
