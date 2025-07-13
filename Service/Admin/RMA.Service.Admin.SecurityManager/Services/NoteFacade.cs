using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Exceptions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class NoteFacade : RemotingStatelessService, INoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_Note> _noteRepository;
        private readonly IMapper _mapper;

        public NoteFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactor,
            IRepository<security_Note> noteRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactor;
            _noteRepository = noteRepository;
            _mapper = mapper;
        }

        public async Task<int> AddNote(NoteModel note)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<security_Note>(note);
                _noteRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task EditNote(NoteModel note)
        {
            Contract.Requires(note != null);
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var dataNote = await _noteRepository
                    .ProjectTo<Note>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == note.Id, $"Could not find a note with the id {note.Id}");

                if (ModifiedByIsDifferent(note, dataNote))
                    throw new BusinessException("A note cannot be edited except by the user that created it");

                var entity = _mapper.Map<security_Note>(note);
                _noteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<NoteModel> GetNote(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await _noteRepository
                    .ProjectTo<NoteModel>(_mapper.ConfigurationProvider)
                    .SingleAsync(s => s.Id == id);

                return note;
            }
        }

        public async Task<List<NoteModel>> GetNotes(string itemType, int itemId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var notes = await _noteRepository
                    .Where(note => note.ItemId == itemId && note.ItemType == itemType)
                    .ProjectTo<NoteModel>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                notes.ForEach(note => note.Text = note.Text.Length > 30 ? $"{note.Text.Substring(0, 30)}" : note.Text);

                return notes;
            }
        }

        private static bool ModifiedByIsDifferent(AuditDetails note, Note dataNote)
        {
            return string.CompareOrdinal(note.ModifiedBy, dataNote.CreatedBy) > 0;
        }
    }
}