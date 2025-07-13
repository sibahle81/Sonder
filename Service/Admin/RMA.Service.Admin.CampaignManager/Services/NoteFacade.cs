using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class NoteFacade : RemotingStatelessService, INoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_Note> _noteRepository;
        private readonly IMapper _mapper;

        public NoteFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_Note> noteRepository,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _noteRepository = noteRepository;
            _mapper = mapper;
        }

        public async Task<Note> GetNoteById(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await _noteRepository
                    .ProjectTo<Note>(_mapper.ConfigurationProvider)
                    .SingleAsync(
                        n => n.Id == id,
                        $"Could not find Note with id {id}");
                return note;
            }
        }

        public async Task<List<Note>> GetNotes(string itemType, int itemId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var note = await _noteRepository
                    .Where(n =>
                        n.ItemType.Equals(itemType, StringComparison.OrdinalIgnoreCase)
                        && n.ItemId == itemId)
                    .ProjectTo<Note>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return note;
            }
        }

        public async Task<int> AddNote(Note note)
        {
            using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var entity = _mapper.Map<campaign_Note>(note);
                _noteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task EditNote(Note note)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_Note>(note);
                _noteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
    }
}