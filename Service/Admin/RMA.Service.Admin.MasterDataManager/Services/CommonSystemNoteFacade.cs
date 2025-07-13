using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class CommonSystemNoteFacade : RemotingStatelessService, ICommonSystemNoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_Note> _commonNoteRepository;
        private readonly IRepository<common_NoteModule> _commonNoteModuleRepository;
        private readonly IMapper _mapper;

        public CommonSystemNoteFacade(IDbContextScopeFactory dbContextScopeFactory,
        IRepository<common_Note> commonNoteRepository,
        IRepository<common_NoteModule> commonNoteModuleRepository,
        StatelessServiceContext context,
        IMapper mapper) : base(context)
        {
            _commonNoteRepository = commonNoteRepository;
            _commonNoteModuleRepository = commonNoteModuleRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _mapper = mapper;
        }

        public async Task<int> CreateCommonSystemNote(CommonSystemNote note)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_Note>(note);

                entity = _commonNoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task<bool> CheckIfCommonNoteHasBeenAdded(int itemId, string message)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _commonNoteRepository.FirstOrDefaultAsync(a => a.ItemId == itemId && a.Text == message);
                return result != null;
            }
        }

        public async Task<int> UpdateCommonSystemNote(CommonSystemNote note)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<common_Note>(note);

                _commonNoteRepository.Update(entity);
                return await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UpdateCommonSystemNoteKeys(ModuleTypeEnum module, NoteItemTypeEnum oldNoteItemType, int oldItemId, NoteItemTypeEnum newNoteItemType, int newItemId)
        {
            var modules = new List<ModuleTypeEnum>() { module };
            var request = new CommonSystemNoteSearchRequest() {ItemId = oldItemId, NoteItemType = oldNoteItemType, ModuleType = modules};
            request.PagedRequest = new PagedRequest();
            var commonNotes = await GetPagedCommonSystemNotes(request);

            foreach (var commonNote in commonNotes.Data)
            {
                commonNote.NoteItemType = newNoteItemType;
                commonNote.ItemId = newItemId;
                await UpdateCommonSystemNote(commonNote);
            }
        }

        public async Task<PagedRequestResult<CommonSystemNote>> GetPagedCommonSystemNotes(CommonSystemNoteSearchRequest commonSystemNoteSearchRequest)
        {
           Contract.Requires(commonSystemNoteSearchRequest!=null);
           Contract.Requires(commonSystemNoteSearchRequest.PagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var itemId = commonSystemNoteSearchRequest.ItemId;
                var NoteCategory = commonSystemNoteSearchRequest.NoteCategory ?? 0;
                var NoteItemType = commonSystemNoteSearchRequest.NoteItemType ?? 0;
                var NoteType = commonSystemNoteSearchRequest.NoteType ?? 0;
                var ModuleType = commonSystemNoteSearchRequest.ModuleType;
                var commonNote = _commonNoteRepository.Select(i => i);
                var commonNoteModule = _commonNoteModuleRepository.Select(i => i);

                if (itemId > 0)
                {
                    commonNote = _commonNoteRepository.Where(i => i.ItemId == itemId);
                }

                if (NoteCategory != 0)
                    commonNote = commonNote.Where(i => i.NoteCategory == NoteCategory);
                if (NoteItemType != 0)
                    commonNote = commonNote.Where(i => i.NoteItemType == NoteItemType);
                if (NoteType != 0)
                    commonNote = commonNote.Where(i => i.NoteType == NoteType);
                if (!string.IsNullOrEmpty(commonSystemNoteSearchRequest.Text))
                    commonNote = commonNote.Where(i => i.Text.Contains(commonSystemNoteSearchRequest.Text));
                if (ModuleType.Any())
                    commonNoteModule = _commonNoteModuleRepository.Where(i => ModuleType.Contains(i.ModuleType));

                var notesList = await (
                        from n in commonNote
                        join nm in commonNoteModule on n.Id equals nm.NoteId
                        select n
                        ).ToPagedResult(commonSystemNoteSearchRequest.PagedRequest);

                var results = _mapper.Map<List<common_Note>>(notesList.Data);
                await _commonNoteRepository.LoadAsyncIncludeDeleted(results, t => t.NoteModules);
                var notesdData = _mapper.Map<List<CommonSystemNote>>(results);

                return new PagedRequestResult<CommonSystemNote>
                {
                    Page = commonSystemNoteSearchRequest.PagedRequest.Page,
                    PageCount = commonSystemNoteSearchRequest.PagedRequest.PageSize,
                    RowCount = notesList.RowCount,
                    PageSize = commonSystemNoteSearchRequest.PagedRequest.PageSize,
                    Data = notesdData
                };
            }
        }

        public async Task<CommonSystemNote> GetCommonSystemNote(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var commonNote = await _commonNoteRepository.FindByIdAsync(id);
                return _mapper.Map<CommonSystemNote>(commonNote);
            }
        }

    }

}