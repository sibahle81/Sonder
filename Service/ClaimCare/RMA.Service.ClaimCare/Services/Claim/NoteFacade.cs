namespace RMA.Service.ClaimCare.Services.Claim
{
    using AutoMapper;

    using Common.Database.Contracts.ContextScope;
    using Common.Database.Contracts.Repository;
    using Common.Database.Extensions;
    using Common.Entities;
    using Common.Exceptions;
    using Common.Service.ServiceFabric;

    using Contracts.Entities;
    using Contracts.Interfaces.Claim;

    using Database.Entities;

    using System.Collections.Generic;
    using System.Fabric;
    using System.Linq;
    using System.Threading.Tasks;

    public class NoteFacade : RemotingStatelessService, INoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        private readonly IRepository<claim_ClaimNote> _claimNoteRepository;

        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_Event> _eventRepository;

        private readonly IRepository<claim_PersonEvent> _personEventRepository;

        public NoteFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<claim_ClaimNote> claimNoteRepository,
            IRepository<claim_Claim> claimRepository,
             IRepository<claim_Event> eventRepository,
            IRepository<claim_PersonEvent> personEventRepository)
            : base(context)
        {
            this._dbContextScopeFactory = dbContextScopeFactory;
            this._claimNoteRepository = claimNoteRepository;
            this._claimRepository = claimRepository;
            this._personEventRepository = personEventRepository;
            this._eventRepository = eventRepository;
        }

        public async Task<int> AddNote(Note note)
        {
            using (var scope = this._dbContextScopeFactory.Create())
            {
                var claimNote = new ClaimNote();

                if (note.ItemType == "PersonEvent")
                {
                    var personEvent = await _personEventRepository.FirstOrDefaultAsync(personEvnt => personEvnt.PersonEventId == note.ItemId);
                    if (personEvent != null)
                    {
                        claimNote = new ClaimNote
                        {
                            PersonEventId = note.ItemId,
                            Text = note.Text,
                            PersonEventStatus = personEvent.PersonEventStatus,
                            Reason = note.Reason,
                            ClaimStatus = null
                        };
                    }
                }
                else if (note.ItemType == "Event")
                {
                    var eventDetail = await this._eventRepository.FirstOrDefaultAsync(n => n.EventId == note.ItemId);

                    if (eventDetail != null)
                    {
                        claimNote = new ClaimNote
                        {
                            EventId = note.ItemId,
                            Text = note.Text,
                            PersonEventId = null,
                            ClaimStatus = null,
                            Reason = note.Reason
                        };
                    }
                }
                else if (note.ItemType == "Claim")
                {

                    var claim = await this._claimRepository.FirstOrDefaultAsync(n => n.ClaimId == note.ItemId);

                    if (claim != null)
                    {
                        claimNote = new ClaimNote
                        {
                            ClaimId = note.ItemId,
                            Text = note.Text,
                            PersonEventId = claim.PersonEventId,
                            ClaimStatus = claim.ClaimStatus,
                            Reason = note.Reason
                        };
                    }
                }

                var entity = Mapper.Map<claim_ClaimNote>(claimNote);

                this._claimNoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.ClaimNoteId;
            }
        }

        public async Task EditNote(ClaimNote note)
        {
            using (var scope = this._dbContextScopeFactory.Create())
            {
                var dataNote = await this.FindNote(note.ClaimNoteId);

                dataNote.ClaimNoteId = note.ClaimNoteId;
                dataNote.IsDeleted = note.IsDeleted;
                dataNote.Text = note.Text;

                this._claimNoteRepository.Update(Mapper.Map<claim_ClaimNote>(dataNote));

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<ClaimNote> GetNote(int id) => await this.FindNote(id);

        public async Task<List<ClaimNote>> GeNotes(string itemType, int itemId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var claimNotes = new List<claim_ClaimNote>();

                switch (itemType)
                {
                    case "PersonEvent":
                        claimNotes = await this._claimNoteRepository.Where(n => n.PersonEventId == itemId && n.Reason != "Tracing").ToListAsync();
                        break;

                    case "Claim":
                        claimNotes = await this._claimNoteRepository.Where(n => n.ClaimId == itemId && n.Reason != "Tracing").ToListAsync();
                        break;
                }

                return Mapper.Map<List<ClaimNote>>(claimNotes);
            }
        }

        public async Task<List<ClaimNote>> GetNotesByClaimId(int claimId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var result = await this._claimNoteRepository.Where(note => note.ClaimId == claimId && note.Reason != "Tracing").ToListAsync();
                return Mapper.Map<List<ClaimNote>>(result);
            }
        }

        public async Task<bool> CheckIfNoteHasBeenAdded(int personEventId, string message)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _claimNoteRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId && a.Text == message);
                return result != null;
            }
        }

        private async Task<ClaimNote> FindNote(int noteId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var note = await this._claimNoteRepository.FindByIdAsync(noteId);

                if (note == null)
                {
                    throw new BusinessException($"Could not find Note with id {noteId}");
                }

                return Mapper.Map<ClaimNote>(note);
            }
        }
    }
}