using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Product
{
    public interface IProductNoteService : IService
    {
        Task<Note> GetNote(int id);
        Task<int> AddNote(Note noteModel);
        Task EditNote(Note noteModel);
        Task<List<Note>> GetNotes(int productId);
    }
}