using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Client;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Api.Controllers.RolePlayer
{
    [Route("api/RolePlayer/[controller]")]

    public class RolePlayerController : RmaApiController
    {
        private readonly IRolePlayerService _rolePlayerService;
        private readonly ILastViewedService _lastViewedService;

        public RolePlayerController(IRolePlayerService rolePlayerService, ILastViewedService lastViewedService)
        {
            _rolePlayerService = rolePlayerService;
            _lastViewedService = lastViewedService;

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Contracts.Entities.RolePlayer.RolePlayer>> Get(int id)
        {
            var rolePlayer = await _rolePlayerService.GetRolePlayer(id);
            return Ok(rolePlayer);
        }

        [HttpGet("CheckVopdStatus/{rolePlayerId}")]
        public async Task<ActionResult<bool>> CheckVopdStatus(int rolePlayerId)
        {
            var rolePlayer = await _rolePlayerService.CheckVopdStatus(rolePlayerId);
            return Ok(rolePlayer);
        }

        [HttpGet("GetMainMemberByPolicyId/{policyId}")]
        public async Task<ActionResult<RolePlayerRelation>> GetMainMemberByPolicyId(int policyId)
        {
            var rolePlayer = await _rolePlayerService.GetMainMemberByPolicyId(policyId);
            return Ok(rolePlayer);
        }

        [HttpGet("GetVOPDResponseResultByRoleplayerId/{rolePlayerId}")]
        public async Task<ActionResult<ClientVopdResponse>> GetVOPDResponseResultByRoleplayerId(int rolePlayerId)
        {
            var clientVopdResponse = await _rolePlayerService.GetVOPDResponseResultByRoleplayerId(rolePlayerId);
            return Ok(clientVopdResponse);
        }


        [HttpGet("CheckIfGroupPolicy/{policyId}")]
        public async Task<ActionResult<bool>> CheckIfGroupPolicy(int policyId)
        {
            return await _rolePlayerService.CheckIfGroupPolicy(policyId);
        }

        [HttpGet("GetInsuredLifeByPolicyId/{policyId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> GetInsuredLifeByPolicyId(int policyId)
        {
            return await _rolePlayerService.GetInsuredLifeByPolicyId(policyId);
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> Get()
        {
            var brokerageList = await _rolePlayerService.GetRolePlayers();
            return Ok(brokerageList);
        }

        [HttpGet("GetRolePlayerTypesIsRelation")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayerType>>> GetRolePlayerTypes()
        {
            var rolePlayerTypes = await _rolePlayerService.GetRolePlayerIsRelation();
            return Ok(rolePlayerTypes);
        }

        [HttpGet("{roleType}/{registrationNumber}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> SearchRolePlayerByRegistrationNumber(KeyRoleEnum roleType, string registrationNumber)
        {
            var rolePlayer = await _rolePlayerService.SearchRolePlayerByRegistrationNumber(roleType, registrationNumber.Decode());
            return Ok(rolePlayer);
        }
        [HttpGet("GetByRegistrationNumber/{roleType}/{registrationNumber}")]
        public async Task<ActionResult<List<Contracts.Entities.RolePlayer.RolePlayer>>> SearchRolePlayersByRegistrationNumber(KeyRoleEnum roleType, string registrationNumber)
        {
            var rolePlayer = await _rolePlayerService.SearchRolePlayersByRegistrationNumber(roleType, registrationNumber.Decode());
            return Ok(rolePlayer);
        }
        [HttpGet("GetRolePlayerTypes")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayerType>>> GetRolePlayerTypes([FromQuery] List<int> typeId)
        {
            var list = await _rolePlayerService.GetRolePlayerTypes(typeId);
            return Ok(list);
        }

        [HttpGet("GetLinkedRolePlayers/{rolePlayerId}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> GetLinkedRolePlayers(int rolePlayerId, [FromQuery] List<int> typeId)
        {
            var list = await _rolePlayerService.GetLinkedRolePlayers(rolePlayerId, typeId);
            return Ok(list);
        }

        [HttpGet("GetRolePlayersByRoleType/{rolePlayerType}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> GetRolePlayersByRoleType(string rolePlayerType)
        {
            switch (rolePlayerType?.ToLower())
            {
                case "policyowner":
                    var policyOwner = await _rolePlayerService.GetAllPolicyOwners();
                    return Ok(policyOwner);
                case "policypayee":
                    var policyPayee = await _rolePlayerService.GetAllPolicyPayees();
                    return Ok(policyPayee);
                case "insuredlife":
                    var insuredLife = await _rolePlayerService.GetAllInsuredLives();
                    return Ok(insuredLife);
                case "financialserviceprovider":
                    var financialServiceProvider = await _rolePlayerService.GetAllFinancialServiceProviders();
                    return Ok(financialServiceProvider);
                case "claimant":
                    var claimant = await _rolePlayerService.GetAllClaimants();
                    return Ok(claimant);
                case "medicalserviceprovider":
                    var medicalServiceProvider = await _rolePlayerService.GetAllMedicalServiceProviders();
                    return Ok(medicalServiceProvider);
                case "funeralparlor":
                    var funeralParlor = await _rolePlayerService.GetAllFuneralParlors();
                    return Ok(funeralParlor);
                case "bodycollector":
                    var bodyCollector = await _rolePlayerService.GetAllBodyCollectors();
                    return Ok(bodyCollector);
                case "undertaker":
                    var undertaker = await _rolePlayerService.GetAllUndertakers();
                    return Ok(undertaker);
                default:
                    return null;
            }
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.RolePlayer.RolePlayer>>> SearchRolePlayers(int page = 1, int pageSize = 5, string orderBy = "RolePlayerId", string sortDirection = "asc", string query = "")
        {
            var brokerages = await _rolePlayerService.SearchRolePlayers(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(brokerages);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] Contracts.Entities.RolePlayer.RolePlayer rolePlayer)
        {
            var rolePlayerId = await _rolePlayerService.CreateRolePlayer(rolePlayer);
            return Ok(rolePlayerId);
        }

        [HttpPost("AddRelation")]
        public async Task AddRelation([FromBody] Contracts.Entities.RolePlayer.RolePlayerRelation rolePlayerRelation)
        {
            await _rolePlayerService.AddRolePlayerRelation(rolePlayerRelation);
        }

        [HttpPut]
        public async Task<ActionResult<bool>> Put([FromBody] Contracts.Entities.RolePlayer.RolePlayer rolePlayer)
        {
            await _rolePlayerService.EditRolePlayer(rolePlayer);
            return Ok(true);
        }

        [HttpGet("GetPersonRolePlayerByIdNumber/{idType}/{query?}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> GetPersonRolePlayerByIdNumber(IdTypeEnum idType, string query = "")
        {
            var roleplayers = await _rolePlayerService.GetPersonRolePlayerByIdNumber(idType, query);
            return Ok(roleplayers);
        }

        [HttpGet("GetRolePlayerByIdNumber/{idNumber}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> GetRolePlayerByIdNumber(string idNumber)
        {
            var roleplayers = await _rolePlayerService.GetRolePlayerByIdNumber(idNumber);
            return Ok(roleplayers);
        }

        [HttpGet("GetPersonDetailsByIdNumber/{idType}/{query}")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> GetPersonDetailsByIdNumber(IdTypeEnum idType, string query)
        {
            var rolePlayer = await _rolePlayerService.GetPersonDetailsByIdNumber(idType, query);
            return Ok(rolePlayer);
        }

        [HttpPost("StillBornDuplicateCheck")]
        public async Task<ActionResult<bool>> StillBornDuplicateCheck([FromBody] Contracts.Entities.RolePlayer.Person person)
        {
            var rolePlayer = await _rolePlayerService.StillBornDuplicateCheck(person);
            return Ok(rolePlayer);
        }

        [HttpPost("DoesRelationExist")]
        public async Task<ActionResult<bool>> DoesRelationExist([FromBody] RolePlayerRelation rolePlayerRelation)
        {
            var rolePlayer = await _rolePlayerService.DoesRelationExist(rolePlayerRelation);
            return Ok(rolePlayer);
        }

        [HttpGet("SearchAccounts/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<List<AccountSearchResult>>> SearchAccounts(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var accounts = await _rolePlayerService.SearchAccounts(new PagedRequest(query.Decode(), page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(accounts);
        }

        [HttpGet("GetBankingDetailsByRolePlayerId/{rolePlayerId}")]
        public async Task<ActionResult<List<RolePlayerBankingDetail>>> GetBankingDetailsByRolePlayerId(int rolePlayerId)
        {
            var rolePlayerBankingDetails = await _rolePlayerService.GetBankingDetailsByRolePlayerId(rolePlayerId);
            return Ok(rolePlayerBankingDetails);
        }

        [HttpGet("GetFinPayee/{rolePlayerId}")]
        public async Task<ActionResult<FinPayee>> GetFinPayee(int rolePlayerId)
        {
            var finPayee = await _rolePlayerService.GetFinPayee(rolePlayerId);
            return Ok(finPayee);
        }

        [HttpGet("SearchForFinPayees/{query}")]
        public async Task<ActionResult<List<DebtorSearchResult>>> SearchForFinPayees(string query)
        {
            var debtors = await _rolePlayerService.SearchForFinPayees(query);
            return Ok(debtors);
        }

        [HttpGet("GetDebtorIndustryClassBankAccountNumber/{finPayeNumber}")]
        public async Task<ActionResult<string>> GetDebtorIndustryClassBankAccountNumber(string finPayeNumber)
        {
            var accountNumber = await _rolePlayerService.GetDebtorIndustryClassBankAccountNumber(finPayeNumber);
            return Ok(accountNumber);
        }

        [HttpGet("GetDebtorIndustryClass/{finPayeNumber}")]
        public async Task<ActionResult<IndustryClassEnum>> GetDebtorIndustryClass(string finPayeNumber)
        {
            IndustryClassEnum industryClass = await _rolePlayerService.GetDebtorIndustryClass(finPayeNumber);
            return Ok(industryClass);
        }

        [HttpGet("GetActiveBankingDetails/{rolePlayerId}")]
        public async Task<ActionResult<RolePlayerBankingDetail>> GetActiveBankingDetails(int rolePlayerId)
        {
            var rolePlayerBankingDetails = await _rolePlayerService.GetActiveBankingDetails(rolePlayerId);
            return Ok(rolePlayerBankingDetails);
        }

        [HttpGet("GetPreviousInsurerRolePlayer/{rolePlayerId}")]
        public async Task<ActionResult<PreviousInsurerRolePlayer>> GetPreviousInsurerRolePlayer(int rolePlayerId)
        {
            var previousInsurerRolePlayerDetails = await _rolePlayerService.GetPreviousInsurerRolePlayer(rolePlayerId);
            return Ok(previousInsurerRolePlayerDetails);
        }

        [HttpGet("GetMemberPortalPolicyRolePlayer/{rolePlayerId}")]
        public async Task<ActionResult<Contracts.Entities.RolePlayer.RolePlayer>> GetMemberPortalPolicyRolePlayer(int rolePlayerId)
        {
            var rolePlayer = await _rolePlayerService.GetMemberPortalPolicyRolePlayer(rolePlayerId);
            return Ok(rolePlayer);
        }

        [HttpGet("CheckIfRolePlayerExists/{idNumber}")]
        public async Task<ActionResult> CheckIfRolePlayerExists(string idNumber)
        {
            var rolePlayerId = await _rolePlayerService.CheckIfRolePlayerExists(idNumber);
            return Ok(rolePlayerId);
        }

        [HttpGet("RolePlayerExists/{rolePlayerId}")]
        public async Task<ActionResult<bool>> RolePlayerExists(int rolePlayerId)
        {
            var exists = await _rolePlayerService.RolePlayerExists(rolePlayerId);
            return Ok(exists);
        }

        [HttpGet("GetBankingDetailsByAccountNumber/{accountNumber}")]
        public async Task<ActionResult<List<RolePlayerBankingDetail>>> GetBankingDetailsByAccountNumber(string accountNumber)
        {
            var rolePlayerBankingDetails = await _rolePlayerService.GetBankingDetailsByAccountNumber(accountNumber);
            return Ok(rolePlayerBankingDetails);
        }

        [HttpGet("GetRolePlayerContactDetails/{rolePlayerId}")]
        public async Task<ActionResult> GetRolePlayerContactDetails(int rolePlayerId)
        {
            var rolePlayerContactDetails = await _rolePlayerService.GetRolePlayerContactDetails(rolePlayerId);
            return Ok(rolePlayerContactDetails);
        }

        [HttpPut("EditRolePlayerContact")]
        public async Task<ActionResult> EditRolePlayerContact([FromBody] RolePlayerContact rolePlayerContact)
        {
            var rolePlayerContactId = await _rolePlayerService.EditRolePlayerContactDetails(rolePlayerContact);
            return Ok(rolePlayerContactId);
        }

        [HttpPost("CreateRolePlayerContactDetails")]
        public async Task<ActionResult> CreateRolePlayerContactDetails([FromBody] RolePlayerContact rolePlayerContact)
        {
            var rolePlayerContactId = await _rolePlayerService.CreateRolePlayerContactDetails(rolePlayerContact);
            return Ok(rolePlayerContactId);
        }

        [HttpPost("CreatePersonEmployment")]
        public async Task<ActionResult> CreatePersonEmployment([FromBody] PersonEmployment personEmployment)
        {
            var rolePlayerContactId = await _rolePlayerService.CreatePersonEmployment(personEmployment);
            return Ok(rolePlayerContactId);
        }

        [HttpPut("EditPersonEmployment")]
        public async Task<ActionResult> EditPersonEmployment([FromBody] PersonEmployment personEmployment)
        {
            var personEmploymentId = await _rolePlayerService.EditPersonEmployment(personEmployment);
            return Ok(personEmploymentId);
        }

        [HttpGet("GetPersonEmployment/{personEmployeeId}/{personEmployerId}")]
        public async Task<ActionResult> GetPersonEmployment(int personEmployeeId, int personEmployerId)
        {
            var result = await _rolePlayerService.GetPersonEmployment(personEmployeeId, personEmployerId);
            return Ok(result);
        }

        [HttpGet("GetPersonEmploymentByPersonEmploymentId/{personEmploymentId}")]
        public async Task<ActionResult> GetPersonEmploymentByPersonEmploymentId(int personEmploymentId)
        {
            var result = await _rolePlayerService.GetPersonEmploymentByPersonEmploymentId(personEmploymentId);
            return Ok(result);
        }

        [HttpGet("GetRolePlayerPolicyCount/{rolePlayerId}")]
        public async Task<ActionResult<int>> GetRolePlayerPolicyCount(int rolePlayerId)
        {
            var policyCount = await _rolePlayerService.GetRolePlayerPolicyCount(rolePlayerId);
            return Ok(policyCount);
        }

        [HttpGet("GetPersonEmploymentByIndustryNumber/{industryNumber}")]
        public async Task<ActionResult> GetPersonEmploymentByIndustryNumber(string industryNumber)
        {
            var personEmployment = await _rolePlayerService.GetPersonEmploymentByIndustryNumber(industryNumber);
            return Ok(personEmployment);
        }

        [HttpGet("GetFinPayeeByFinpayeNumber/{finPayeNumber}")]
        public async Task<ActionResult<FinPayee>> GetFinPayeeByFinpayeNumber(string finPayeNumber)
        {
            var finpayee = await _rolePlayerService.GetFinPayeeByFinpayeNumber(finPayeNumber);
            return Ok(finpayee);
        }

        [HttpPost("SaveBeneficiary")]
        public async Task<ActionResult<int>> SaveRolePlayerBeneficiaries([FromBody] Contracts.Entities.RolePlayer.RolePlayer rolePlayer)
        {
            var rolePlayerId = await _rolePlayerService.SaveRolePlayerBeneficiaries(rolePlayer);
            return Ok(rolePlayerId);
        }

        [HttpGet("GetPagedRolePlayerContacts/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<List<AccountSearchResult>>> GetPagedRolePlayerContacts(int page = 1, int pageSize = 5, string orderBy = "RolePlayerContactId", string sortDirection = "asc", string query = "")
        {
            var accounts = await _rolePlayerService.GetPagedRolePlayerContacts(new PagedRequest(query.Decode(), page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(accounts);
        }

        [HttpGet("GetPagedBeneficiaries/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.RolePlayer.RolePlayer>>> GetPagedBeneficiaries(int page = 1, int pageSize = 5, string orderBy = "RolePlayerId", string sortDirection = "asc", string query = "")
        {
            var brokerages = await _rolePlayerService.GetPagedBeneficiaries(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(brokerages);
        }

        [HttpGet("GetBeneficiary/{beneficiaryId}")]
        public async Task<ActionResult<FinPayee>> GetBeneficiary(int beneficiaryId)
        {
            var finpayee = await _rolePlayerService.GetBeneficiary(beneficiaryId);
            return Ok(finpayee);
        }

        [HttpGet("GetPagedRolePlayerAddress/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerAddress>>> GetPagedRolePlayerAddress(int page = 1, int pageSize = 5, string orderBy = "RolePlayerId", string sortDirection = "asc", string query = "")
        {
            var accounts = await _rolePlayerService.GetPagedRolePlayerAddress(new PagedRequest(query.Decode(), page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(accounts);
        }

        [HttpGet("GetPagedRolePlayerBankingDetails/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<RolePlayerBankingDetail>>> GetPagedRolePlayerBankingDetails(int page = 1, int pageSize = 5, string orderBy = "RolePlayerId", string sortDirection = "asc", string query = "")
        {
            var accounts = await _rolePlayerService.GetPagedRolePlayerBankingDetails(new PagedRequest(query.Decode(), page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(accounts);
        }

        [HttpPut("UpdateRolePlayerRelations")]
        public async Task<ActionResult<bool>> UpdateRolePlayerRelations([FromBody] RolePlayerRelation relation)
        {
            var isUpdated = await _rolePlayerService.UpdateRolePlayerRelations(relation);
            return Ok(isUpdated);
        }

        [HttpPut("DeleteRolePlayerRelation")]
        public async Task<ActionResult<bool>> DeleteRolePlayerRelation([FromBody] RolePlayerRelation relation)
        {
            var isDeleted = await _rolePlayerService.DeleteRolePlayerRelation(relation);
            return Ok(isDeleted);
        }

        [HttpGet("RolePlayerVopdRequest/{saId}")]
        public async Task<ActionResult<bool>> RolePlayerVopdRequest(string saId)
        {
            var result = await _rolePlayerService.UserPlayerVopdRequest(saId);
            return Ok(result);
        }

        [HttpGet("SearchDebtors/{industryClassId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.RolePlayer.RolePlayer>>> SearchDebtors(int industryClassId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var debtors = await _rolePlayerService.SearchDebtors(industryClassId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(debtors);
        }

        [HttpPost("UpdateDebtor")]
        public async Task<ActionResult<bool>> UpdateDebtor([FromBody] FinPayee debtor)
        {
            var result = await _rolePlayerService.UpdateFinPayee(debtor);
            return Ok(result);
        }

        [HttpPost("OverrideRolePlayerVopd")]
        public async Task<ActionResult<bool>> Post([FromBody] VopdUpdateResponseModel vopdUpdateResponse)
        {
            var result = await _rolePlayerService.OverrideRolePlayerVopd(vopdUpdateResponse);
            return Ok(result);
        }

        [HttpGet("GetRolePlayerPersonByIdOrPassport/{idPassportNumber}")]
        public async Task<ActionResult<Contracts.Entities.RolePlayer.RolePlayer>> GetRolePlayerPersonByIdOrPassport(string idPassportNumber)
        {
            var result = await _rolePlayerService.GetRolePlayerPersonByIdOrPassport(idPassportNumber);
            return Ok(result);
        }

        [HttpGet("GetPagedPersonEmployment/{employerRolePlayerId}/{employeeRolePlayerId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<PersonEmployment>>> GetPagedPersonEmployment(int employerRolePlayerId, int employeeRolePlayerId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var results = await _rolePlayerService.GetPagedPersonEmployment(employerRolePlayerId, employeeRolePlayerId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

        [HttpGet("GetPagedRolePlayers/{rolePlayerIdentificationTypeId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.RolePlayer.RolePlayer>>> GetPagedRolePlayers(int rolePlayerIdentificationTypeId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var results = await _rolePlayerService.GetPagedRolePlayers(rolePlayerIdentificationTypeId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

        [HttpGet("GetPagedRolePlayerRelations/{fromRolePlayerId}/{rolePlayerTypeId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.RolePlayer.RolePlayer>>> GetPagedRolePlayerRelations(int fromRolePlayerId, int rolePlayerTypeId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var results = await _rolePlayerService.GetPagedRolePlayerRelations(fromRolePlayerId, rolePlayerTypeId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }

        [HttpGet("GetPagedRolePlayerPolicyRelations/{rolePlayerId}/{policyId}/{rolePlayerTypeId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Contracts.Entities.RolePlayer.RolePlayer>>> GetPagedRolePlayerPolicyRelations(int rolePlayerId, int policyId, int rolePlayerTypeId, int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var results = await _rolePlayerService.GetPagedRolePlayerPolicyRelations(rolePlayerId, policyId, rolePlayerTypeId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(results);
        }


        [HttpPost("UpdateBankingDetails")]
        public async Task<ActionResult<int>> UpdateBankingDetails([FromBody] RolePlayerBankingDetail rolePlayerBankingDetail)
        {
            var result = await _rolePlayerService.UpdateBankingDetails(rolePlayerBankingDetail);
            return Ok(result);
        }


        [HttpPost("AddBankingDetails")]
        public async Task<ActionResult<int>> AddBankingDetails([FromBody] RolePlayerBankingDetail rolePlayerBankingDetail)
        {
            var result = await _rolePlayerService.AddBankingDetails(rolePlayerBankingDetail);
            return Ok(result);
        }

        [HttpGet("GetDebtorBankAccountNumbers/{finPayeeNumber}")]
        public async Task<ActionResult<List<string>>> GetDebtorBankAccountNumbers(string finPayeeNumber)
        {
            var results = await _rolePlayerService.GetDebtorBankAccountNumbers(finPayeeNumber);
            return Ok(results);
        }

        [HttpGet("GetBeneficiaries")]
        public async Task<ActionResult<IEnumerable<Contracts.Entities.RolePlayer.RolePlayer>>> GetBeneficiaries([FromQuery] List<int> roleplayerIds)
        {
            var list = await _rolePlayerService.GetBeneficiaries(roleplayerIds);
            return Ok(list);
        }


        [HttpPost("BulkDebtorHandover")]
        public async Task<ActionResult<int>> BulkDebtorHandover([FromBody] List<FinPayee> finpayees)
        {
            var results = await _rolePlayerService.BulkDebtorHandover(finpayees);
            return Ok(results);
        }
    }
}