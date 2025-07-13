using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IPolicyNoteService : IService
    {
        Task<Note> GetNote(int id);
        Task<int> AddNote(Note noteModel);
        Task EditNote(Note noteModel);
        Task<List<Note>> GetNotes(int policyId);

        Task<PagedRequestResult<PolicyNote>> GetPagedPolicyNotes(PagedRequest pagedRequest);
        Task<int> AddPolicyNote(PolicyNote policyNote);
        Task EditPolicyNote(PolicyNote policyNote);
    }
}