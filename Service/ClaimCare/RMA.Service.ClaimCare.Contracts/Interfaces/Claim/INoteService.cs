using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface INoteService : IService
    {
        Task<ClaimNote> GetNote(int id);
        Task<List<ClaimNote>> GeNotes(string itemType, int itemId);
        Task<int> AddNote(Note note);
        Task EditNote(ClaimNote note);
        Task<List<ClaimNote>> GetNotesByClaimId(int claimId);
        Task<bool> CheckIfNoteHasBeenAdded(int personEventId, string message);
    }
}
