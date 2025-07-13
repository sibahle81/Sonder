using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.MediCare;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class MedicalInvoiceClaimFacade : RemotingStatelessService, IMedicalInvoiceClaimService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IRepository<claim_Event> _eventRepository;
        private readonly IRepository<claim_PhysicalDamage> _physicalDamageRepository;
        private readonly IRepository<claim_Injury> _injuryRepository;
        private readonly IRepository<claim_SecondaryInjury> _secondaryInjuryRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IUserService _userService;
        private readonly IICD10CodeService _icd10CodeService;
        private readonly IRepository<claim_ClaimBenefit> _claimBenefitRepository;
        private readonly IBenefitService _benefitService;
        private readonly IRepository<claim_PersonEventAccidentDetail> _claimPersonEventAccidentDetail;
        private readonly IRepository<claim_MedicalReport> _claimMedicalReport;

        public MedicalInvoiceClaimFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_Claim> claimRepository
            , IRepository<claim_PersonEvent> personEventRepository
            , IRepository<claim_Event> eventRepository
            , IRepository<claim_PhysicalDamage> physicalDamageRepository
            , IRepository<claim_Injury> injuryRepository
            , IRepository<claim_SecondaryInjury> secondaryInjuryRepository
            , IRolePlayerService rolePlayerService
            , IUserService userService
            , IICD10CodeService icd10CodeService
            , IRepository<claim_ClaimBenefit> claimBenefitRepository
            , IRepository<claim_PersonEventAccidentDetail> claimPersonEventAccidentDetail
            , IBenefitService benefitService
            , IRepository<claim_MedicalReport> claimMedicalReport)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _claimRepository = claimRepository;
            _personEventRepository = personEventRepository;
            _eventRepository = eventRepository;
            _physicalDamageRepository = physicalDamageRepository;
            _injuryRepository = injuryRepository;
            _secondaryInjuryRepository = secondaryInjuryRepository;
            _rolePlayerService = rolePlayerService;
            _userService = userService;
            _icd10CodeService = icd10CodeService;
            _claimBenefitRepository = claimBenefitRepository;
            _benefitService = benefitService;
            _claimPersonEventAccidentDetail = claimPersonEventAccidentDetail;
            _claimMedicalReport = claimMedicalReport;
        }

        public async Task<MedicalInvoiceClaim> GetMedicalInvoiceClaim(string claimReferenceNumber)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimReferenceNumber == claimReferenceNumber);

                return claimEntity != null ? await SetMedicalInvoiceClaim(claimEntity) : null;
            }
        }

        public async Task<MedicalInvoiceClaim> GetMedicalInvoiceClaimByPersonEventId(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);

                return claimEntity != null ? await SetMedicalInvoiceClaim(claimEntity) : null;
            }
        }

        private async Task<MedicalInvoiceClaim> SetMedicalInvoiceClaim(claim_Claim claimEntity)
        {
            try
            {
                var medicalInvoiceClaim = new MedicalInvoiceClaim();

                if (claimEntity == null)
                {
                    return medicalInvoiceClaim;
                }

                var user = await _userService.GetUserByEmail(RmaIdentity.Email);

                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == claimEntity.PersonEventId);
                if (personEventEntity != null)
                {
                    var eventEntity = await _eventRepository.FirstOrDefaultAsync(a => a.EventId == personEventEntity.EventId);
                    if (eventEntity != null)
                    {
                        medicalInvoiceClaim.ClaimId = claimEntity.ClaimId;
                        medicalInvoiceClaim.ClaimReferenceNumber = claimEntity.ClaimReferenceNumber;
                        medicalInvoiceClaim.ClaimLiabilityStatus = claimEntity.ClaimLiabilityStatus.ToString();
                        medicalInvoiceClaim.PersonEventId = claimEntity.PersonEventId;
                        medicalInvoiceClaim.EventDate = eventEntity.EventDate;
                        medicalInvoiceClaim.EventTypeId = (int)eventEntity.EventType;
                        medicalInvoiceClaim.EventId = personEventEntity.EventId;
                        medicalInvoiceClaim.IsPensionCase = false;
                        medicalInvoiceClaim.PensionCaseNumber = string.Empty;
                        medicalInvoiceClaim.IsStp = personEventEntity.IsStraightThroughProcess;

                        if (string.IsNullOrEmpty(RmaIdentity.Email) || user.IsInternalUser)
                        {
                            var rolePlayer = await _rolePlayerService.GetRolePlayer(personEventEntity.InsuredLifeId);
                            if (rolePlayer != null)
                            {
                                medicalInvoiceClaim.EmployerName = rolePlayer?.Company?.CompanyName;
                                medicalInvoiceClaim.IndustryNumber = DateTime.Now.Millisecond.ToString();
                                medicalInvoiceClaim.PersonName = rolePlayer.Person.FirstName + " " + rolePlayer.Person.Surname;
                                medicalInvoiceClaim.IdNumber = rolePlayer.Person.IdNumber;
                                medicalInvoiceClaim.PassportNumber = rolePlayer.Person.PassportNumber;
                                medicalInvoiceClaim.DateOfBirth = rolePlayer.Person.DateOfBirth;
                                medicalInvoiceClaim.DateOfDeath = rolePlayer.Person.DateOfDeath;
                                medicalInvoiceClaim.IsAlive = rolePlayer.Person.IsAlive;
                                medicalInvoiceClaim.ClaimContactNo = rolePlayer.CellNumber;
                            }
                        }
                        else
                        {
                            var rolePlayerExternal = await _rolePlayerService.GetRolePlayerForExternal(personEventEntity.InsuredLifeId);
                            if (rolePlayerExternal != null)
                            {
                                medicalInvoiceClaim.EmployerName = rolePlayerExternal.CompanyName;
                                medicalInvoiceClaim.IndustryNumber = rolePlayerExternal.IndustryNumber;
                                medicalInvoiceClaim.PersonName = rolePlayerExternal.FirstName + " " + rolePlayerExternal.Surname;
                                medicalInvoiceClaim.IdNumber = rolePlayerExternal.IdNumber;
                                medicalInvoiceClaim.PassportNumber = rolePlayerExternal.PassportNumber;
                                medicalInvoiceClaim.DateOfBirth = rolePlayerExternal.DateOfBirth;
                                medicalInvoiceClaim.DateOfDeath = rolePlayerExternal.DateOfDeath;
                                medicalInvoiceClaim.IsAlive = rolePlayerExternal.IsAlive;
                                medicalInvoiceClaim.ClaimContactNo = rolePlayerExternal.CellNumber;
                            }
                        }
                    }
                }

                return medicalInvoiceClaim;
            }
            catch (Exception ex)
            {
                ex.LogException();
            }

            return null;
        }

        public async Task<List<MedicalInvoiceInjury>> GetMedicalInvoiceClaimInjury(int personEventId)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var injuries = await (
                                   from pd in _physicalDamageRepository
                                   join inj in _injuryRepository on pd.PhysicalDamageId equals inj.PhysicalDamageId
                                   where pd.PersonEventId == personEventId
                                   select new MedicalInvoiceInjury
                                   {
                                       Icd10CodeId = inj.Icd10CodeId,
                                       BodySideAffectedType = inj.BodySideAffectedType
                                   }).Distinct().ToListAsync();

                    foreach (var injury in injuries)
                    {
                        var icd10Code = await _icd10CodeService.GetICD10CodeById(injury.Icd10CodeId);
                        injury.Icd10Code = icd10Code.Icd10Code;
                        var icd10CodeModel = await _icd10CodeService.FilterICD10Code(icd10Code.Icd10Code);
                        if (icd10CodeModel?.Count > 0)
                        {
                            injury.ICD10DiagnosticGroupId = icd10CodeModel[0].Icd10DiagnosticGroupId;
                            injury.ICD10DiagnosticGroupCode = icd10CodeModel[0].Icd10DiagnosticGroupCode;
                            injury.ICD10CategoryId = icd10CodeModel[0].Icd10CategoryId;
                            injury.ICD10CategoryCode = icd10CodeModel[0].Icd10CategoryCode;
                            injury.IsPrimary = true;
                        }
                    }

                    return injuries;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<MedicalInvoiceInjury>> GetMedicalInvoiceClaimSecondaryInjuries(int personEventId)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var injuries = await (
                                   from pd in _physicalDamageRepository
                                   join inj in _injuryRepository on pd.PhysicalDamageId equals inj.PhysicalDamageId
                                   join secondary in _secondaryInjuryRepository on inj.InjuryId equals secondary.PrimaryInjuryId
                                   where pd.PersonEventId == personEventId
                                   select new MedicalInvoiceInjury
                                   {
                                       Icd10CodeId = secondary.Icd10CodeId,
                                       BodySideAffectedType = secondary.BodySideAffectedType
                                   }).Distinct().ToListAsync();

                    foreach (var injury in injuries)
                    {
                        var icd10Code = await _icd10CodeService.GetICD10CodeById(injury.Icd10CodeId);
                        injury.Icd10Code = icd10Code.Icd10Code;
                        var icd10CodeModel = await _icd10CodeService.FilterICD10Code(icd10Code.Icd10Code);
                        if (icd10CodeModel?.Count > 0)
                        {
                            injury.ICD10DiagnosticGroupId = icd10CodeModel[0].Icd10DiagnosticGroupId;
                            injury.ICD10DiagnosticGroupCode = icd10CodeModel[0].Icd10DiagnosticGroupCode;
                            injury.ICD10CategoryId = icd10CodeModel[0].Icd10CategoryId;
                            injury.ICD10CategoryCode = icd10CodeModel[0].Icd10CategoryCode;
                            injury.IsPrimary = false;
                        }
                    }
                    return injuries;

                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<string> GetClaimReferenceNumberByPersonEventId(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                return claimEntity?.ClaimReferenceNumber;
            }
        }

        public async Task<int> GetPersonEventIdByClaimReferenceNumber(string claimReferenceNumber)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimReferenceNumber == claimReferenceNumber);
                return Convert.ToInt32(claimEntity?.PersonEventId);
            }
        }

        public async Task<bool> ValidateMedicalBenefit(int claimId, DateTime invoiceDate)
        {
            /* Change to false after Medical Benefits are added on the Claim - start */
            bool isExist = true;
            /* Change to false after Medical Benefits are added on the Claim - end */
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var benefit = await _benefitService.GetBenefitByName("Medical Costs Benefit");
                if (benefit?.Id > 0)
                {
                    isExist = await (from cbr in _claimBenefitRepository
                                     where cbr.ClaimId == claimId && cbr.BenefitId == benefit.Id
                                     && (invoiceDate <= DateTime.MinValue || (invoiceDate >= benefit.StartDate && invoiceDate <= benefit.EndDate))
                                     select cbr).AnyAsync();
                }
            }

            return isExist;
        }

        public async Task<PagedRequestResult<MedicalSwitchBatchSearchPersonEvent>> GetSearchMedicalSwitchBatchPersonEvent(PagedRequest request)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEventSearch = JsonConvert.DeserializeObject<MedicalSwitchBatchSearchPersonEvent>(request?.SearchCriteria);
                SqlParameter[] parameters = {
                    new SqlParameter("@IndustryNumber", !(string.IsNullOrEmpty(personEventSearch.IndustryNumber)) ? (string)personEventSearch.IndustryNumber.Trim() : (object)DBNull.Value),
                    new SqlParameter("@SurName", !(string.IsNullOrEmpty(personEventSearch.Surname)) ? (string)personEventSearch.Surname.Trim() : (object)DBNull.Value),
                    new SqlParameter("@FirstName", !(string.IsNullOrEmpty(personEventSearch.FullFirstname)) ? (string)personEventSearch.FullFirstname.Trim() : (object)DBNull.Value),
                    new SqlParameter("@OtherInitial", !(string.IsNullOrEmpty(personEventSearch.Initials)) ? (string)personEventSearch.Initials.Trim() : (object)DBNull.Value),
                    new SqlParameter("@IDNumber", !(string.IsNullOrEmpty(personEventSearch.IdNumber)) ? (string)personEventSearch.IdNumber.Trim() : (object)DBNull.Value),
                    new SqlParameter("@OtherIDNumber", !(string.IsNullOrEmpty(personEventSearch.OtherIdentification)) ? (string)personEventSearch.OtherIdentification.Trim() : (object)DBNull.Value),
                    new SqlParameter("@DateOfBirthCriterion", (personEventSearch.DateOfBirth.HasValue) ? personEventSearch.DateOfBirth : (object)DBNull.Value),
                    new SqlParameter("@EmployeeNumber", !(string.IsNullOrEmpty(personEventSearch.CoemployeeNo)) ? (string)personEventSearch.CoemployeeNo.Trim() : (object)DBNull.Value),
                    new SqlParameter("@PassportNumber", !(string.IsNullOrEmpty(personEventSearch.PassportNumber)) ? (string)personEventSearch.PassportNumber.Trim() : (object)DBNull.Value),
                    new SqlParameter("@CountryOfPassportID", personEventSearch.PassportNationality > 0 ? (int)personEventSearch.PassportNationality : (object)DBNull.Value),
                    new SqlParameter("@EventID", personEventSearch.EventId > 0 ? (int)personEventSearch.EventId : (object)DBNull.Value),
                    new SqlParameter("@MainClaimRefNo", !(string.IsNullOrEmpty(personEventSearch.MainClaimRefNo)) ? (string)personEventSearch.MainClaimRefNo.Trim() : (object)DBNull.Value),
                    new SqlParameter("@DateOfEventCriterion", (personEventSearch.DateOfEvent.HasValue) ? personEventSearch.DateOfEvent : (object)DBNull.Value),

                    new SqlParameter("@PageNumber", request.Page),
                    new SqlParameter("@RowsOfPage", request.PageSize),
                    new SqlParameter("@SortingCol", request.OrderBy),
                    new SqlParameter("@SortType", (request.IsAscending) ? " ASC " : " DESC "),
                    new SqlParameter("RecordCount", SqlDbType.Int),
                };

                parameters[17].Direction = ParameterDirection.Output;

                var searchResult = await _claimRepository.SqlQueryAsync<MedicalSwitchBatchSearchPersonEvent>(DatabaseConstants.MedicalSwitchBatchPersonEventSearchStoredProcedure, parameters);
                var recordCount = (int)parameters[17].Value;

                return new PagedRequestResult<MedicalSwitchBatchSearchPersonEvent>()
                {
                    Page = request.Page,
                    PageCount = searchResult.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = searchResult
                };
            }
        }

        public async Task<List<PersonEventAccidentDetail>> GetPersonEventAccidentDetailsByEventId(int eventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEventClaimData = await (
                   from ped in _claimPersonEventAccidentDetail
                   where ped.PersonEvent.EventId == eventId
                   select ped
                  ).ToListAsync();

                if (personEventClaimData != null)
                    return Mapper.Map<List<PersonEventAccidentDetail>>(personEventClaimData);
                else
                    return Mapper.Map<List<PersonEventAccidentDetail>>(new PersonEventAccidentDetail());
            }
        }

        public async Task<bool> CheckIsStpClaim(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEventEntity = await (
                               from claim in _claimRepository
                               join personEvent in _personEventRepository on claim.PersonEventId equals personEvent.PersonEventId
                               where claim.PersonEventId == personEventId
                               select personEvent
                               ).FirstOrDefaultAsync();

                return Convert.ToBoolean(personEventEntity?.IsStraightThroughProcess);
            }
        }

        public async Task<bool> IsChronic(int personEventId, DateTime dateAdmitted)
        {
            bool isChronic = false;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                if (personEventEntity != null)
                {
                    var eventEntity = await _eventRepository.FirstOrDefaultAsync(a => a.EventId == personEventEntity.EventId);
                    if (eventEntity != null)
                    {
                        isChronic = dateAdmitted > eventEntity.EventDate.AddYears(ClaimConstants.AddYearsForChronicCheck);
                    }
                }

            }
            return isChronic;
        }

        public async Task<ClaimDetailsForSTPIntegration> GetClaimDetailsForSTPIntegration(string claimReferenceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("ClaimReferenceNumber", claimReferenceNumber)
                };

                var medicalInvoiceClaimQuery = await _claimRepository.SqlQueryAsync<ClaimDetailsForSTPIntegration>(DatabaseConstants.GetClaimValidationsSTPIntegrationStoredProcedure, parameters);
                return medicalInvoiceClaimQuery.FirstOrDefault();
            }
        }

        public async Task<bool> CheckClaimMedicalBenefitsExistForSTPIntegration(string claimReferenceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("ClaimReferenceNumber", claimReferenceNumber)
                };

                var medicalBenefitsExist = await _claimRepository.SqlQueryAsync<bool>(DatabaseConstants.CheckClaimMedicalBenefitsExistForSTPIntegration, parameters);
                return medicalBenefitsExist.FirstOrDefault();
            }
        }

        public async Task<List<MedicalInvoiceInjury>> GetClaimInjuryDetailsForSTPIntegration(string claimReferenceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                     new SqlParameter("ClaimReferenceNumber", claimReferenceNumber)
                };

                var medicalInvoiceClaimQuery = await _claimRepository.SqlQueryAsync<MedicalInvoiceInjury>(DatabaseConstants.GetClaimInjuryValidationsSTPIntegrationStoredProcedure, parameters);
                return medicalInvoiceClaimQuery;
            }
        }

        public async Task<bool> CreateClaimMedicalReport(MedicalReport medicalReport)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_MedicalReport>(medicalReport);

                _claimMedicalReport.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }

        public async Task<List<MedicalReport>> GetClaimMedicalReport(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimMedicalReport.Where(report => report.PersonEventId == personEventId).ToListAsync();
                return Mapper.Map<List<MedicalReport>>(entity);
            }
        }
        public async Task<MedicalReport> GetSickNoteByMedicalReportId(int medicalReportId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimMedicalReport
                    .Where(report => report.MedicalReportId == medicalReportId && !report.IsDeleted)
                    .FirstOrDefaultAsync();

                if (entity == null)
                {
                    return null;
                }

                return Mapper.Map<MedicalReport>(entity);
            }
        }
        public async Task<bool> UpdateSickNote(MedicalReport medicalReport)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (medicalReport == null || medicalReport.MedicalReportId <= 0)
                {
                    return false;
                }

                var existingEntity = await _claimMedicalReport
                    .Where(report => report.MedicalReportId == medicalReport.MedicalReportId && !report.IsDeleted)
                    .FirstOrDefaultAsync();

                if (existingEntity == null)
                {
                    return false;
                }

                Mapper.Map(medicalReport, existingEntity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return true;
            }
        }
    }
}
