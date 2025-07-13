using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ScanCare.Contracts.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserRegistrationController : ControllerBase
    {
        private readonly ILookupService _lookupService;
        private readonly IUserRegistrationService _userRegistrationService;
        private readonly ICityService _cityRepository;
        private readonly ICountryService _countryRepository;
        private readonly IBankService _bankRepository;
        private readonly IBankBranchService _bankBranchService;
        private readonly IStateProvinceService _stateProvinceRepository;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IConfigurationService _configurationService;
        private readonly IWizardService _wizardService;
        private readonly IUserService _userService;

        public UserRegistrationController(
            ILookupService lookupService,
            IUserRegistrationService userRegistrationService,
            ICityService cityRepository,
            IBankService bankRepository,
            IBankBranchService bankBranchService,
            ICountryService countryRepository,
            IStateProvinceService stateProvinceRepository,
            IDocumentIndexService documentIndexService,
            IConfigurationService configurationService,
            IWizardService wizardService,
            IUserService userService)
        {
            _lookupService = lookupService;
            _userRegistrationService = userRegistrationService;
            _cityRepository = cityRepository;
            _documentIndexService = documentIndexService;
            _configurationService = configurationService;
            _countryRepository = countryRepository;
            _bankRepository = bankRepository;
            _bankBranchService = bankBranchService;
            _stateProvinceRepository = stateProvinceRepository;
            _wizardService = wizardService;
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpGet("AddressType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetAddressTypes()
        {
            return await _lookupService.GetAddressTypes();
        }

        [AllowAnonymous]
        [HttpGet("IdType")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetIdTypes()
        {
            return await _lookupService.GetIdTypes();
        }

        [AllowAnonymous]
        [HttpGet("GetUserDetailsByIdNumber/{idNumber}")]
        public async Task<ActionResult<User>> GetUserDetailsByIdNumber(string idNumber)
        {
            var user = await _userRegistrationService.GetUserDetailsByIdNumber(idNumber);
            return Ok(user);
        }

        // GET: mdm/api/City
        [AllowAnonymous]
        [HttpGet("City")]
        public async Task<ActionResult<IEnumerable<City>>> Get()
        {
            var cities = await _cityRepository.GetCities();
            return Ok(cities);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(int id)
        {
            var user = await _userService.GetUserById(id);
            return Ok(user);
        }

        // GET: mdm/api/Country
        [AllowAnonymous]
        [HttpGet("GetModuleSetting/{key}")]
        public async Task<ActionResult<string>> GetModuleSetting(string key)
        {
            var setting = await _configurationService.GetModuleSetting(key);
            return Ok(JsonConvert.SerializeObject(setting));
        }

        // GET: mdm/api/Country
        [AllowAnonymous]
        [HttpGet("GetCountries")]
        public async Task<ActionResult<IEnumerable<Country>>> GetCountries()
        {
            var countries = await _countryRepository.GetCountries();
            return Ok(countries);
        }

        [AllowAnonymous]
        [HttpGet("GetBanks")]
        public async Task<ActionResult<IEnumerable<Bank>>> GetBanks()
        {
            var banks = await _bankRepository.GetBanks();
            return Ok(banks);
        }

        [AllowAnonymous]
        [HttpGet("GetBankBranches")]
        public async Task<ActionResult<IEnumerable<BankBranch>>> GetBankBranches()
        {
            var branches = await _bankBranchService.GetBranches();
            return Ok(branches);
        }

        [AllowAnonymous]
        [HttpGet("GetStateProvincesByCountry/{countryId}")]
        public async Task<ActionResult<IEnumerable<StateProvince>>> GetStateProvincesByCountry(int countryId)
        {
            var stateProvinces = await _stateProvinceRepository.GetStateProvincesByCountry(countryId);
            return Ok(stateProvinces);
        }

        [AllowAnonymous]
        [HttpPost("RegisterUserDetails")]
        public async Task<ActionResult<bool>> RegisterUserDetails(UserDetails userDetails)
        {
            var result = await _userRegistrationService.RegisterUserDetails(userDetails);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("ProcessVopdResponse")]
        public async Task<ActionResult> ProcessVopdResponse()
        {
            await _userRegistrationService.ProcessVopdResponse();
            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("GetMemberDetailsByActivateId/{ActivateId}")]
        public async Task<ActionResult<UserDetails>> GetMemberDetailsByActivateId(string activateId)
        {
            var result = await _userRegistrationService.GetMemberDetailsByActivateId(activateId);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("CreateUser")]
        public async Task<ActionResult<string>> CreateUser(UserDetails userDetails)
        {
            var result = await _userRegistrationService.CreateNewMember(userDetails);
            return JsonConvert.SerializeObject(result);
        }

        [AllowAnonymous]
        [HttpPost("CreateUserV2")]
        public async Task<ActionResult<bool>> CreateUserV2(UserDetails userDetails)
        {
            var result = await _userRegistrationService.CreateUser(userDetails);
            return Ok(result > 0);
        }
        
        [AllowAnonymous]
        [HttpGet("GetCityByProvince/{provinceId}")]
        public async Task<ActionResult<IEnumerable<City>>> GetCityByProvince(int provinceId)
        {
            var cities = await _cityRepository.GetCityByProvince(provinceId);
            return Ok(cities);
        }

        [AllowAnonymous]
        [HttpPost("GetDocumentsBySetAndKey")]
        public async Task<ActionResult<List<Document>>> GetDocumentsBySetAndKey([FromBody] DocumentRequest documentRequest)
        {
            if (documentRequest != null)
            {
                var documents = await _documentIndexService.GetDocumentsBySetAndKey(documentRequest.DocumentSet, documentRequest.Keys);
                return Ok(documents);
            }
            return new List<Document>();
        }

        [AllowAnonymous]
        [HttpGet("GetDocumentBinary/{documentId}")]
        public async Task<ActionResult<List<Document>>> GetDocumentBinary(int documentId)
        {
            var documents = await _documentIndexService.GetDocumentBinary(documentId);
            return Ok(documents);
        }

        [AllowAnonymous]
        [HttpPost("SaveUpload")]
        public async Task<Document> SaveUpload([FromBody] Document document)
        {
            return await _documentIndexService.UploadDocument(document);
        }

        [AllowAnonymous]
        [HttpPost("OnDocumentUpload")]
        public async Task<ActionResult> OnDocumentUpload(UserDetails userDetails)
        {
            await _userRegistrationService.OnDocumentUpload(userDetails);
            return Ok();
        }

        [AllowAnonymous]
        [HttpPut("UpdateDocument")]
        public async Task<ActionResult> UpdateDocument([FromBody] Document document)
        {
            await _documentIndexService.UpdateDocument(document);
            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("GetUserDetailsByEmail/{emailAddress}")]
        public async Task<ActionResult<User>> GetUserDetailsByEmail(string emailAddress)
        {
            var user = await _userRegistrationService.GetUserDetailsByEmail(emailAddress);
            return Ok(user);
        }

        [AllowAnonymous]
        [HttpGet("ResendUserActivation/{ActivateId}")]
        public async Task<ActionResult<bool>> ResendUserActivation(string activateId)
        {
            var result = await _userRegistrationService.ResendUserActivation(activateId);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("SendMemberPasswordResetLink/{emailAddress}")]
        public async Task<ActionResult<bool>> SendMemberPasswordResetLink(string emailAddress)
        {
            var result = await _userRegistrationService.SendMemberPasswordResetLink(emailAddress);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("UpdateUser")]
        public async Task<ActionResult<int>> UpdateUser(UserDetails userDetails)
        {
            var result = await _userRegistrationService.UpdateMember(userDetails);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("CheckIfBrokerageExists/{fspNumber}")]
        public async Task<ActionResult<int>> CheckIfBrokerageExists(string fspNumber)
        {
            var user = await _userRegistrationService.CheckIfBrokerageExists(fspNumber);
            return Ok(user);
        }

        [AllowAnonymous]
        [HttpGet("GetUserDetailsVopdResponse/{idNumber}")]
        public async Task<ActionResult<string>> GetUserDetailsVopdResponse(string idNumber)
        {
            var result = await _userRegistrationService.GetUserDetailsVopdResponse(idNumber);
            return JsonConvert.SerializeObject(result);
        }

        [AllowAnonymous]
        [HttpGet("CheckIfWizardHasBeenCreated/{type}/{data}")]
        public async Task<ActionResult<bool>> CheckIfWizardHasBeenCreated(string type, string data)
        {
            var result = await _wizardService.CheckIfWizardHasBeenCreated(type, data);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("GetCompcareUsersByEmailAddress/{email}")]
        public async Task<ActionResult<List<CompcareUser>>> GetCompcareUsersByEmailAddress(string email)
        {
            var userList = await _userService.GetCompcareUsersByEmailAddress(email);
            return Ok(userList);
        }

        [AllowAnonymous]
        [HttpGet("GetUserByUserDetailId/{userDetailId}")]
        public async Task<ActionResult<UserDetails>> GetUserByUserDetailId(int userDetailId)
        {
            var userDetail = await _userRegistrationService.GetUserByUserDetailId(userDetailId);
            return Ok(userDetail);
        }

        

        [HttpGet("GetUserActivationUserDetailsByUserActivationId/{userActivationId}")]
        public async Task<ActionResult<UserDetails>> GetUserActivationUserDetailsByUserActivationId(int userActivationId)
        {
            var userDetails = await _userRegistrationService.GetUserActivationUserDetailsByUserActivationId(userActivationId);
            return Ok(userDetails);
        }

        [HttpGet("ResendUserActivationEmail/{userActivationId}")]
        public async Task<ActionResult<bool>> ResendUserActivationEmail(int userActivationId)
        {
            var result = await _userRegistrationService.ResendUserActivationEmail(userActivationId);
            return Ok(result);
        }

        [HttpGet("IsUserPendingRegistration/{userName}")]
        public async Task<ActionResult<bool>> IsUserPendingRegistration(string userName)
        {
            var result = await _userRegistrationService.IsUserPendingRegistration(userName);
            return Ok(result);
        }

        [HttpGet("GetPendingUserActivation/{userName}")]
        public async Task<ActionResult<int>> GetPendingUserActivation(string userName)
        {
            var result = await _userRegistrationService.GetPendingUserActivation(userName);
            return Ok(result);
        }
    }
}