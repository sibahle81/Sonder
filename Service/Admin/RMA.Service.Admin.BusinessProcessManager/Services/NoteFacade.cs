using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.BusinessProcessManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.BusinessProcessManager.Services
{
    public class NoteFacade : RemotingStatelessService, INoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<bpm_Note> _noteRepository;
        private readonly IMapper _mapper;

        public NoteFacade(StatelessServiceContext serviceContext
            , IRepository<bpm_Note> noteRepository
            , IDbContextScopeFactory dbContextScopeFactory
            , IMapper mapper) : base(serviceContext)
        {
            _noteRepository = noteRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _mapper = mapper;
        }

        public async Task<int> AddNote(Note noteModel)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<bpm_Note>(noteModel);
                _noteRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task<Note> GetNote(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await _noteRepository.FindByIdAsync(id);
                return _mapper.Map<Note>(note);
            }
        }

        public async Task<List<Note>> GetNotes(string itemType, int itemId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = await _noteRepository.Where(n => n.ItemId == itemId).ToListAsync();
                return _mapper.Map<List<Note>>(notes);
            }
        }

        public async Task<int> AddNoteForWizard(int wizardId, string text)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var note = new Note
                {
                    ItemId = wizardId,
                    Text = text,
                    ItemType = "Wizard",
                    IsDeleted = false
                };

                var entity = _mapper.Map<bpm_Note>(note);
                _noteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }
    }
}