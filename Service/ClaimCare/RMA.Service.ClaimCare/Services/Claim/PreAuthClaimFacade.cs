using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class PreAuthClaimFacade : RemotingStatelessService, IPreAuthClaimService
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
        private readonly IRepository<claim_ClaimBenefit> _claimBenefitRepository;
        private readonly IBenefitService _benefitService;
        private readonly IPolicyService _policyService;

        public PreAuthClaimFacade(StatelessServiceContext context
         , IDbContextScopeFactory dbContextScopeFactory
         , IRepository<claim_Claim> claimRepository
         , IRepository<claim_PersonEvent> personEventRepository
         , IRepository<claim_Event> eventRepository
         , IRepository<claim_PhysicalDamage> physicalDamageRepository
         , IRepository<claim_Injury> injuryRepository
         , IRepository<claim_SecondaryInjury> secondaryInjuryRepository
         , IRolePlayerService rolePlayerService
         , IUserService userService
         , IRepository<claim_ClaimBenefit> claimBenefitRepository
         , IBenefitService benefitService
         , IPolicyService policyService)
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
            _claimBenefitRepository = claimBenefitRepository;
            _benefitService = benefitService;
            _policyService = policyService;
        }


        public async Task<PreAuthClaim> GetPreAuthClaimDetail(string claimReferenceNumber)
        {
            try
            {
                claimReferenceNumber = claimReferenceNumber.ToStringFromBase64();
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimReferenceNumber == claimReferenceNumber);

                    if (claimEntity != null)
                    {
                        return await SetPreAuthDetail(claimEntity);
                    }
                    else
                    {
                        return new PreAuthClaim();
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<PreAuthClaim> GetPreAuthClaimDetailByClaimId(int claimId)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimId == claimId);

                    if (claimEntity != null)
                    {
                        return await SetPreAuthDetail(claimEntity);
                    }
                    else
                    {
                        return new PreAuthClaim();
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<PreAuthClaim> GetPreAuthClaimDetailByPersonEventId(int personEventId)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);

                    if (claimEntity != null)
                    {
                        return await SetPreAuthDetail(claimEntity);
                    }
                    else
                    {
                        return new PreAuthClaim { };
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private async Task<PreAuthClaim> SetPreAuthDetail(claim_Claim claimEntity)
        {
            var preAuthClaim = new PreAuthClaim();

            if (claimEntity == null) return preAuthClaim;

            var user = await _userService.GetUserByEmail(RmaIdentity.Email);

            var personEventEntity = await _personEventRepository.FirstOrDefaultAsync(a => a.PersonEventId == claimEntity.PersonEventId);
            if (personEventEntity != null && personEventEntity.InsuredLifeId > 0)
            {
                var eventEntity = await _eventRepository.FirstOrDefaultAsync(a => a.EventId == personEventEntity.EventId);
                if (eventEntity != null)
                {
                    preAuthClaim.ClaimId = claimEntity.ClaimId;
                    preAuthClaim.ClaimReferenceNumber = claimEntity.ClaimReferenceNumber;
                    preAuthClaim.ClaimLiabilityStatus = claimEntity.ClaimLiabilityStatus.ToString();
                    preAuthClaim.ClaimStatus = claimEntity.ClaimStatus;
                    preAuthClaim.PersonEventId = claimEntity.PersonEventId;
                    preAuthClaim.EventDate = eventEntity.EventDate;
                    preAuthClaim.EventTypeId = (int)eventEntity.EventType;
                    preAuthClaim.EventId = personEventEntity.EventId;
                    preAuthClaim.IsPensionCase = false;
                    preAuthClaim.PensionCaseNumber = string.Empty;
                    preAuthClaim.IsStp = personEventEntity.IsStraightThroughProcess;
                    preAuthClaim.PolicyId = claimEntity.PolicyId;

                    if (user.IsInternalUser)
                    {
                        var rolePlayer = await _rolePlayerService.GetRolePlayer(personEventEntity.InsuredLifeId);

                        if (rolePlayer != null)
                        {
                            preAuthClaim.EmployerName = rolePlayer?.Company?.CompanyName;
                            preAuthClaim.IndustryNumber = DateTime.Now.Millisecond.ToString();
                            preAuthClaim.PersonName = rolePlayer.Person.FirstName + " " + rolePlayer.Person.Surname;
                            preAuthClaim.IdNumber = rolePlayer.Person.IdNumber;
                            preAuthClaim.PassportNumber = rolePlayer.Person.PassportNumber;
                            preAuthClaim.DateOfBirth = rolePlayer.Person.DateOfBirth;
                            preAuthClaim.DateOfDeath = rolePlayer.Person.DateOfDeath;
                            preAuthClaim.IsAlive = rolePlayer.Person.IsAlive;
                            preAuthClaim.ClaimContactNo = rolePlayer.CellNumber;
                        }
                    }
                    else
                    {
                        var rolePlayerExternal = await _rolePlayerService.GetRolePlayerForExternal(personEventEntity.InsuredLifeId);

                        if (rolePlayerExternal != null)
                        {
                            preAuthClaim.EmployerName = rolePlayerExternal.CompanyName;
                            preAuthClaim.IndustryNumber = rolePlayerExternal.IndustryNumber;
                            preAuthClaim.PersonName = rolePlayerExternal.FirstName + " " + rolePlayerExternal.Surname;
                            preAuthClaim.IdNumber = rolePlayerExternal.IdNumber;
                            preAuthClaim.PassportNumber = rolePlayerExternal.PassportNumber;
                            preAuthClaim.DateOfBirth = rolePlayerExternal.DateOfBirth;
                            preAuthClaim.DateOfDeath = rolePlayerExternal.DateOfDeath;
                            preAuthClaim.IsAlive = rolePlayerExternal.IsAlive;
                            preAuthClaim.ClaimContactNo = rolePlayerExternal.CellNumber;
                        }
                    }
                }
            }
            return preAuthClaim;
        }

        public async Task<List<Injury>> GetPreAuthClaimInjury(int personEventId)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    return await (
                                   from pd in _physicalDamageRepository
                                   join inj in _injuryRepository on pd.PhysicalDamageId equals inj.PhysicalDamageId
                                   where pd.PersonEventId == personEventId
                                   select new Injury
                                   {
                                       Icd10CodeId = inj.Icd10CodeId,
                                       BodySideAffectedType = inj.BodySideAffectedType
                                   }).Distinct().ToListAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<Injury>> GetPreAuthClaimSecondaryInjuries(int personEventId)
        {
            try
            {
                using (var scope = _dbContextScopeFactory.CreateReadOnly())
                {
                    return await (
                                   from pd in _physicalDamageRepository
                                   join inj in _injuryRepository on pd.PhysicalDamageId equals inj.PhysicalDamageId
                                   join secondary in _secondaryInjuryRepository on inj.InjuryId equals secondary.PrimaryInjuryId
                                   where pd.PersonEventId == personEventId
                                   select new Injury
                                   {
                                       Icd10CodeId = secondary.Icd10CodeId,
                                       BodySideAffectedType = secondary.BodySideAffectedType
                                   }).Distinct().ToListAsync();
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
            if (claimReferenceNumber.IsBase64String())
            {
                claimReferenceNumber = claimReferenceNumber.ToStringFromBase64();
            }

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimReferenceNumber == claimReferenceNumber);
                return Convert.ToInt32(claimEntity?.PersonEventId);
            }
        }

        public async Task<bool> CheckIfMedicalBenifitExists(int claimId)
        {
            bool isExist = false;
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimBenifits = await (from cbr in _claimBenefitRepository
                                           where cbr.ClaimId == claimId
                                           select cbr).ToListAsync();

                if (claimBenifits == null || claimBenifits.Count == 0) return isExist;

                foreach (var claimBenifit in claimBenifits)
                {
                    var productBenefit = await _benefitService.GetMedicalBenefit(claimBenifit.BenefitId, "MedCost");

                    if (productBenefit != null)
                    {
                        isExist = true;
                        break;
                    }
                }
            }
            return isExist;
        }

        public async Task<ClaimLiabilityStatusEnum> GetClaimLiabilityStatus(int personEventId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var claimEntity = await _claimRepository.FirstOrDefaultAsync(a => a.PersonEventId == personEventId);
                return claimEntity?.ClaimLiabilityStatus ?? ClaimLiabilityStatusEnum.LiabilityNotAccepted;
            }
        }

        public async Task<string> GetMedicalBenefitTwoYearRuleData(int claimId, DateTime preAuthFromDate)
        {
            bool hasBenefitMoreThan2Years = false;

            var preAuthClaim = await GetPreAuthClaimDetailByClaimId(claimId);
            var eventDate = preAuthClaim.EventDate;

            if ((bool)(preAuthClaim?.PolicyId.HasValue))
            {
                var policy = await _policyService.GetPolicyWithoutReferenceData(preAuthClaim.PolicyId.Value);
                if (policy?.PolicyOwnerId > 0)
                {
                    var rolePlayer = await _rolePlayerService.GetRolePlayer(policy.PolicyOwnerId);
                    if ((bool)(rolePlayer?.RolePlayerBenefitWaitingPeriod.HasValue) && rolePlayer?.RolePlayerBenefitWaitingPeriod == RolePlayerBenefitWaitingPeriodEnum.MedTwoYear)
                        hasBenefitMoreThan2Years = true;
                }
            }

            return "{\"EventDate\": \"" + eventDate.ToString() + "\",\"RequestDate\":\"" + preAuthFromDate.ToString() + "\",\"HasBenefitMoreThan2Years\": \"" + hasBenefitMoreThan2Years + "\"}";
        }
    }
}
