using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;
using System.Threading.Tasks;


namespace RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer
{
    public interface IRolePlayerNoteService : IService
    {
        Task<Note> GetNote(int id);
        Task<int> AddNote(Note noteModel);
        Task EditNote(Note noteModel);
        Task<List<Note>> GetNotes(int rolePlayerId);
        Task<List<RolePlayerNote>> GetRolePlayerNotes(int rolePlayerId);
        Task<PagedRequestResult<RolePlayerNote>> GetPagedRolePlayerNotes(PagedRequest pagedRequest);
        Task<int> AddRolePlayerNote(RolePlayerNote rolePlayerNote);
        Task EditRolePlayerNote(RolePlayerNote rolePlayerNote);
    }
}
