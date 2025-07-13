using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface ICommonSystemNoteService : IService
    {
        Task<PagedRequestResult<CommonSystemNote>> GetPagedCommonSystemNotes(CommonSystemNoteSearchRequest commonSystemNoteSearchRequest);
        Task<CommonSystemNote> GetCommonSystemNote(int id);
        Task<int> CreateCommonSystemNote(CommonSystemNote commonSystemNote);
        Task<int> UpdateCommonSystemNote(CommonSystemNote commonSystemNote);
        Task UpdateCommonSystemNoteKeys(ModuleTypeEnum module, NoteItemTypeEnum oldNoteItemType, int oldItemId, NoteItemTypeEnum newNoteItemType, int newItemId);
        Task<bool> CheckIfCommonNoteHasBeenAdded(int itemId, string message);
    }
}
