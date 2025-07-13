using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Contracts.Interfaces
{
    public interface INoteService : IService
    {
        Task<NoteModel> GetNote(int id);
        Task<int> AddNote(NoteModel note);
        Task EditNote(NoteModel note);
        Task<List<NoteModel>> GetNotes(string itemType, int itemId);
    }
}