using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces
{
    public interface INoteService : IService
    {
        Task<Note> GetNote(int id);
        Task<int> AddNote(Note noteModel);
        Task<List<Note>> GetNotes(string itemType, int itemId);
        Task<int> AddNoteForWizard(int wizardId, string text);
    }
}