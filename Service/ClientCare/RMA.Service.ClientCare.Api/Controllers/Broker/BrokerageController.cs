using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Broker;
using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using ILastViewedService = RMA.Service.ClientCare.Contracts.Interfaces.Client.ILastViewedService;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Broker
{
    [Route("api/Broker/[controller]")]

    public class BrokerageController : RmaApiController
    {
        private readonly IBrokerageService _brokerageService;
        private readonly ILastViewedService _lastViewedService;
        private readonly IUserRegistrationService _userRegistrationFacade;

        public BrokerageController(IBrokerageService brokerageService, ILastViewedService lastViewedService, IUserRegistrationService userRegistrationService)
        {
            _brokerageService = brokerageService;
            _lastViewedService = lastViewedService;
            _userRegistrationFacade = userRegistrationService;
        }

        // GET: clc/api/Client/Brokerage/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Brokerage>> Get(int id)
        {
            var brokerage = await _brokerageService.GetBrokerage(id);
            return Ok(brokerage);
        }

        [HttpGet("GetBrokerageBasicReferenceData/{id}")]
        public async Task<ActionResult<PagedRequestResult<Brokerage>>> GetBrokerageBasicReferenceData(int id)
        {
            var brokerage = await _brokerageService.GetBrokerageBasicReferenceData(id);
            return Ok(brokerage);
        }

        // GET: clc/api/Client/Brokerage
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Brokerage>>> Get()
        {
            var brokerageList = await _brokerageService.GetBrokerages();
            return Ok(brokerageList);
        }

        [HttpGet("Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query}/{isBinderPartnerSearch}")]
        public async Task<ActionResult<PagedRequestResult<Brokerage>>> SearchBrokerages(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "", bool isBinderPartnerSearch = false)
        {
            var brokerages = await _brokerageService.SearchBrokerages(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), isBinderPartnerSearch);
            return Ok(brokerages);
        }

        // GET: clc/api/Client/Brokerage/{fspnumber}
        [HttpGet("GetBrokerageByFSPNumber/{fspnumber}")]
        public async Task<ActionResult<Brokerage>> Get(string fspNumber)
        {
            var brokerage = await _brokerageService.GetBrokerageByFSPNumber(fspNumber);
            return Ok(brokerage);
        }

        // GET: clc/api/Client/Brokerage/v1/GetBrokerageByFSPNumber/{fspnumber}
        [HttpGet("v1/GetBrokerageByFSPNumber/{fspnumber}")]
        public async Task<ActionResult<BrokerageModel>> GetByFSPNumber(string fspNumber)
        {
            var brokerage = await _brokerageService.GetByFSPNumber(fspNumber);
            return Ok(brokerage);
        }

        //PUT: clc/api/Client/Brokerage/{brokerage}
        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Brokerage brokerage)
        {
            await _brokerageService.EditBrokerage(brokerage);
            return Ok();
        }

        // GET clc/api/Client/Brokerage/LastViewed/{isBinderPartner}
        [HttpGet("LastViewed/{isBinderPartner}")]
        public async Task<ActionResult<IEnumerable<Brokerage>>> LastViewed(bool isBinderPartner = false)
        {
            var brokerages = await _lastViewedService.GetLastViewedBrokerages(isBinderPartner);
            return Ok(brokerages);
        }

        [HttpGet("GetBrokerageFromFsb/{fspNumber}/{brokercode}")]
        public async Task<ActionResult<IEnumerable<Brokerage>>> GetBrokerageFromFsb(string fspNumber, string brokercode)
        {
            var message = await _brokerageService.GetFspFromFsb(fspNumber, true, brokercode);
            return Ok(message);
        }

        [HttpGet("GetBrokerConsultants/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<BrokerConsultant>>> GetBrokerConsultants(int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var brokerages = await _brokerageService.GetBrokerConsultants(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(brokerages);
        }

        [HttpPost("GetBrokeragesByCoverTypeIds")]
        public async Task<ActionResult> GetBrokeragesByCoverTypeIds([FromBody] List<int> coverTypes)
        {
            var message = await _brokerageService.GetBrokeragesByCoverTypeIds(coverTypes);
            return Ok(message);
        }

        [HttpPost("LinkBrokerToMemberPortal")]
        public async Task<ActionResult> LinkBrokerToMemberPortal(UserDetails userDetails)
        {
            var message = await _userRegistrationFacade.RegisterUserDetails(userDetails);
            return Ok(message);
        }

        [HttpPost("DeLinkBrokerToMemberPortal")]
        public async Task<ActionResult> DeLinkBrokerToMemberPortal(UserDetails userDetails)
        {
            var message = await _userRegistrationFacade.DeRegisterUserDetails(userDetails);
            return Ok(message);
        }


        [HttpGet("CheckBrokerLinkedToMemberPortal/{brokerEmail}")]
        public async Task<ActionResult> CheckBrokerLinkedToMemberPortal(string brokerEmail)
        {
            var message = await _userRegistrationFacade.CheckIfBrokerIsLinkedToMemberPortal(brokerEmail);
            return Ok(message);
        }

        [HttpGet("CheckIfBrokerHasActivatedLinkCreated/{brokerEmail}")]
        public async Task<ActionResult> CheckIfBrokerHasActivatedLinkCreated(string brokerEmail)
        {
            var message = await _userRegistrationFacade.CheckIfBrokerHasActivatedLinkCreated(brokerEmail);
            return Ok(message);
        }

        [HttpGet("GetBrokerageImportRequestDetails/{fspNumber}")]
        public async Task<ActionResult<IEnumerable<Brokerage>>> GetBrokerageImportRequestDetails(string fspNumber)
        {
            var brokerage = await _brokerageService.GetBrokerageImportRequestDetails(fspNumber);
            return Ok(brokerage);
        }

        [HttpPost("SubmitFSPDataImportRequest")]
        public async Task<ActionResult<bool>> SubmitFSPDataImportRequest([FromBody] BrokerageRepresentativeRequest request)
        {
            var requestSubmitted = await _brokerageService.SubmitFSPDataImportRequest(request);
            return Ok(requestSubmitted);
        }

        [HttpGet("GetBrokerageByUserId/{userId}")]
        public async Task<ActionResult<IEnumerable<Brokerage>>> GetBrokerageByUserId(int userId)
        {
            var brokerage = await _brokerageService.GetBrokerageByUserId(userId);
            return Ok(brokerage);
        }

        [HttpGet("GetBrokeragesWithAllOption")]
        public async Task<ActionResult<List<string>>> GetBrokeragesWithAllOption()
        {
            var brokers = await _brokerageService.GetBrokeragesWithAllOption();
            return Ok(brokers);
        }

        // GET: clc/api/Client/GetBrokerageAndRepresentativesByFSPNumber/{fspnumber}
        [HttpGet("GetBrokerageAndRepresentativesByFSPNumber/{fspnumber}")]
        public async Task<ActionResult<Brokerage>> GetBrokerageAndRepresentativesByFSPNumber(string fspNumber)
        {
            var brokerage = await _brokerageService.GetBrokerageAndRepresentativesByFSPNumber(fspNumber);
            return Ok(brokerage);
        }

        [HttpGet("ResendUserActivation/{activateId}")]
        public async Task<ActionResult> ResendUserActivation(string activateId)
        {
            var message = await _userRegistrationFacade.ResendUserActivation(activateId);
            return Ok(message);
        }

        [HttpGet("GetUserActivateId/{brokerEmail}")]
        public async Task<ActionResult> GetUserActivateId(string brokerEmail)
        {
            var message = await _userRegistrationFacade.GetUserActivateId(brokerEmail);
            return Ok(message);
        }

        [HttpGet("GetBrokersLinkedtoClaims/{productOptionName}")]
        public async Task<ActionResult> GetBrokersLinkedtoClaims(string productOptionName)
        {
            var brokers = await _brokerageService.GetBrokersLinkedtoClaims(productOptionName);
            return Ok(brokers);
        }

        [HttpGet("GetBrokerageByUserEmail/{userEmail}")]
        public async Task<ActionResult<IEnumerable<Brokerage>>> GetBrokerageByUserEmail(string userEmail)
        {
            var brokerage = await _brokerageService.GetBrokerageByUserEmail(userEmail);
            return Ok(brokerage);
        }

        [HttpPost("ProcessFSPDataImportResponseList")]
        public async Task<ActionResult<bool>> ProcessFSPDataImportResponseList([FromBody] List<Fsp> fsps)
        {
            var brokerage = await _brokerageService.ProcessFSPDataImportResponseList(fsps);
            return Ok(brokerage);
        }

        [HttpGet("GetProductOptionConfigurationsByOptionTypeId/{optionTypeId}/{brokerageId}/{effectiveDate}")]
        public async Task<ActionResult<List<ProductOptionConfiguration>>> GetProductOptionConfigurationsByOptionTypeId(int optionTypeId, int brokerageId, DateTime? effectiveDate)
        {
            var productOptionConfigurations = await _brokerageService.GetProductOptionConfigurationsByOptionTypeId(optionTypeId, brokerageId, effectiveDate);
            return Ok(productOptionConfigurations);
        }

        [HttpGet("GetProductOptionConfigurationsByBrokerageId/{brokerageId}/{effectiveDate}")]
        public async Task<ActionResult<List<ProductOptionConfiguration>>> GetProductOptionConfigurationsByBrokerageId(int brokerageId, DateTime? effectiveDate)
        {
            var productOptionConfigurations = await _brokerageService.GetProductOptionConfigurationsByBrokerageId(brokerageId, effectiveDate);
            return Ok(productOptionConfigurations);
        }

        [HttpGet("GetProductOptionConfigurationsByProductOptionId/{productOptionId}/{effectiveDate}")]
        public async Task<ActionResult<List<ProductOptionConfiguration>>> GetProductOptionConfigurationsByProductOptionId(int productOptionId, DateTime? effectiveDate)
        {

            var productOptionConfigurations = await _brokerageService.GetProductOptionConfigurationsByProductOptionId(productOptionId, effectiveDate);
            return Ok(productOptionConfigurations);
        }
    }
}