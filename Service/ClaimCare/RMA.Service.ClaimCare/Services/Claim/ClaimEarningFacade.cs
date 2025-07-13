using Autofac;

using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimEarningFacade : RemotingStatelessService, IClaimEarningService
    {
        private readonly StatelessServiceContext context;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_Earning> _earningsRepository;
        private readonly IRepository<claim_EarningType> _earningTypeRepository;
        private readonly ICommonSystemNoteService _commonNoteRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimCommunicationService _claimCommunicationService;
        private readonly INoteService _noteService;

        public ClaimEarningFacade(
            StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_Earning> earningsRepository
            , IRepository<claim_PersonEvent> personEventRepository
            , IRepository<claim_Claim> claimRepository
            , IRolePlayerService rolePlayerService
            , IClaimCommunicationService claimCommunicationService
            , INoteService noteService
            , IRepository<claim_EarningType> earningTypeRepository
            , ICommonSystemNoteService commonNoteRepository) :
            base(context)
        {
            this.context = context;
            _dbContextScopeFactory = dbContextScopeFactory;
            _earningsRepository = earningsRepository;
            _earningTypeRepository = earningTypeRepository;
            _commonNoteRepository = commonNoteRepository;
            _personEventRepository = personEventRepository;
            _claimRepository = claimRepository;
            _rolePlayerService = rolePlayerService;
            _claimCommunicationService = claimCommunicationService;
            _noteService = noteService;
        }

        public async Task<Earning> GetEarning(int earningId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _earningsRepository.SingleOrDefaultAsync(s => s.EarningId == earningId);
                await _earningsRepository.LoadAsync(result, s => s.EarningDetails);

                return Mapper.Map<Earning>(result);
            }
        }

        public async Task<List<Earning>> GetEarningsByPersonEventId(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _earningsRepository.Where(x => x.PersonEventId == personEventId).ToListAsync();
                await _earningsRepository.LoadAsync(result, e => e.EarningDetails);

                return Mapper.Map<List<Earning>>(result);
            }
        }

        public async Task<Earning> CreateEarning(Earning earning)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_Earning>(earning);
                _earningsRepository.Create(entity);

                await scope.SaveChangesAsync();

                return Mapper.Map<Earning>(entity);
            }
        }

        public async Task<Earning> UpdateEarning(Earning earning)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_Earning>(earning);

                _earningsRepository.Update(entity);
                await scope.SaveChangesAsync();

                return Mapper.Map<Earning>(entity);
            }
        }

        public async Task<List<EarningType>> GetClaimEarningTypes(bool isVariable)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _earningTypeRepository.Where(x => x.IsVariable == isVariable).ToListAsync();
                return Mapper.Map<List<EarningType>>(result);
            }
        }

        public async Task<List<EarningType>> GetAllEarningTypes()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _earningTypeRepository.ToListAsync();
                return Mapper.Map<List<EarningType>>(result);
            }
        }

        public async Task<bool> NotifyToRecaptureEarnings(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                var mappedEvent = Mapper.Map<Contracts.Entities.PersonEvent>(personEventEntity);
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                string claimNumber = claimEntity.ClaimReferenceNumber;

                SqlParameter[] parameters = {
                    new SqlParameter("PersonEventId", personEventId)
                    };

                var claimDetails = await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(ClaimCare.Database.Constants.DatabaseConstants.GetClaimToAcknowledge, parameters);
                var claimEmail = await GenerateNotificationLetter(claimDetails[0]);
                var employee = await _rolePlayerService.GetPerson(personEventEntity.InsuredLifeId);
                var claimSMS = await GenerateNotificationSMS(claimDetails[0], null);
                var claimCommunicationMessage = await _claimCommunicationService.GetContactDetailsForEmployeeAndEmployer(personEventId, ClaimCommunicationTypeEnum.RecaptureEarnings);

                claimCommunicationMessage.Employee = employee;
                claimCommunicationMessage.ClaimNumber = claimNumber;
                claimCommunicationMessage.PersonEvent = mappedEvent;

                if (claimCommunicationMessage.ClaimEmployerEmail != null)
                {
                    claimCommunicationMessage.ClaimEmployerEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.ClaimEmployerEmail.TemplateType = TemplateTypeEnum.RecaptureEarnings;
                }
                if (claimCommunicationMessage.EmployeeClaimEmail != null)
                {
                    claimCommunicationMessage.EmployeeClaimEmail.Tokens = claimEmail.Tokens;
                    claimCommunicationMessage.EmployeeClaimEmail.TemplateType = TemplateTypeEnum.RecaptureEarnings;
                }
                if (claimCommunicationMessage.ClaimEmployerSMS != null)
                {
                    claimCommunicationMessage.ClaimEmployerSMS.Tokens = claimSMS.Tokens;
                    claimCommunicationMessage.ClaimEmployerSMS.TemplateType = TemplateTypeEnum.RecaptureEarnings;
                }

                if (claimCommunicationMessage.EmployeeClaimSMS != null)
                {
                    claimCommunicationMessage.EmployeeClaimSMS.Tokens = claimSMS.Tokens;
                    claimCommunicationMessage.EmployeeClaimSMS.TemplateType = TemplateTypeEnum.RecaptureEarnings;
                }

                var text = "Notification to recapture earnings";
                await AddingClaimNote(personEventId, text, ItemTypeEnum.PersonEvent);

                claimCommunicationMessage.ClaimCommunicationType = ClaimCommunicationTypeEnum.RecaptureEarnings;
                claimCommunicationMessage.Employee = employee;
                claimCommunicationMessage.ClaimNumber = claimNumber;
                claimCommunicationMessage.PersonEvent = mappedEvent;

                await _claimCommunicationService.PublishCommunicationNotification(claimCommunicationMessage);

                return true;
            }
        }

        private async Task<int> AddingClaimNote(int personEventId, string message, ItemTypeEnum itemTypeEnum)
        {
            Contract.Requires(personEventId > 0);

            return await _noteService.AddNote(new Note
            {
                ItemId = personEventId,
                ItemType = itemTypeEnum.DisplayAttributeValue(),
                Text = message,
                Reason = null
            });
        }

        private Task<ClaimEmail> GenerateNotificationLetter(AutoAjudicateClaim autoAjudicateClaim)
        {
            var claimEmail = new ClaimEmail()
            {
                ClaimId = 0,
                EmailAddress = autoAjudicateClaim.EmployeeEmailAddress,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = TemplateTypeEnum.Email,
                Tokens = new Dictionary<string, string>
                {
                    ["{CompanyName}"] = $"{autoAjudicateClaim.CompanyName}",
                    ["{Address}"] = autoAjudicateClaim.CompanyAddressLine1,
                    ["{City/Town}"] = autoAjudicateClaim.CompanyCity,
                    ["{PostalCode}"] = autoAjudicateClaim.CompanyPostalCode,
                    ["{date}"] = DateTimeHelper.SaNow.ToString("dd MMM yyyy"),
                    ["{ClaimNumber}"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                    ["{EmployeeName}"] = $"{autoAjudicateClaim.EmployeeFirstName} {autoAjudicateClaim.EmployeeSurname}",
                    ["{CompanyNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                    ["{IndustryNumber}"] = autoAjudicateClaim.CompanyReferenceNumber,
                    ["{DateOfAccident}"] = autoAjudicateClaim.EventDate.ToString("dd MMM yyyy"),
                    ["{Title}"] = autoAjudicateClaim.Title.DisplayAttributeValue(),
                    ["{Surname}"] = autoAjudicateClaim.EmployeeSurname,
                }
            };

            return Task.FromResult<ClaimEmail>(claimEmail);
        }

        private Task<ClaimSMS> GenerateNotificationSMS(AutoAjudicateClaim autoAjudicateClaim, string cellNumber)
        {
            var claimSMS = new ClaimSMS()
            {
                ClaimId = 0,
                MobileNumber = cellNumber,
                PersonEventId = autoAjudicateClaim.PersonEventId,
                TemplateType = TemplateTypeEnum.AccidentNotAcknowledged,
                Tokens = new Dictionary<string, string>
                {
                    ["[personEventNumber]"] = autoAjudicateClaim.CompCarePEVRefNumber ?? autoAjudicateClaim.ClaimReferenceNumber,
                }
            };
            return Task.FromResult<ClaimSMS>(claimSMS);
        }

        public async Task<Earning> GetActualEarningsByPersonEventId(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var result = await _earningsRepository.FirstOrDefaultAsync(x => x.PersonEventId == personEventId && !x.IsEstimated);

                return Mapper.Map<Earning>(result);
            }
        }

    }
}