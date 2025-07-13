using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface INoteService : IService
    {
        Task<Note> GetNoteById(int id);
        Task<List<Note>> GetNotes(string itemType, int itemId);
        Task<int> AddNote(Note note);
        Task EditNote(Note note);
    }
}