using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.ClientCare.Contracts.Entities.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;

using System.Collections.Generic;
using System.Threading.Tasks;

using LeadModel = RMA.Service.ClientCare.Contracts.Entities.Lead.Lead;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.ClientCare.Api.Controllers.Lead
{
    [Route("api/Lead/[controller]")]
    public class LeadController : RmaApiController
    {
        private readonly ILeadService _leadService;

        public LeadController(
            ILeadService leadService
        )
        {
            _leadService = leadService;
        }

        // GET clc/api/Lead/Lead
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeadModel>>> Get()
        {
            //TO DO: Consider Paged Results
            var leads = await _leadService.GetLeads();
            return Ok(leads);
        }

        // GET clc/api/Lead/Lead/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LeadModel>> Get(int id)
        {
            var lead = await _leadService.GetLead(id);
            return Ok(lead);
        }

        [HttpGet("GetLeadByRolePlayerId/{rolePlayerId}")]
        public async Task<ActionResult<LeadModel>> GetLeadByRolePlayerId(int rolePlayerId)
        {
            var lead = await _leadService.GetLeadByRolePlayerId(rolePlayerId);
            return Ok(lead);
        }

        [HttpPost("CreateNewLead")]
        public async Task<ActionResult<LeadModel>> CreateNewLead([FromBody] LeadModel leadModel)
        {
            var lead = await _leadService.CreateNewLead(leadModel);
            return Ok(lead);
        }

        [HttpPost("CreateLeads")]
        public async Task<ActionResult<List<LeadModel>>> CreateLeads([FromBody] List<LeadModel> leads)
        {
            var results = await _leadService.CreatLeads(leads);
            return Ok(results);
        }

        [HttpPost("BulkLeadUpload")]
        public async Task<ActionResult<List<LeadModel>>> BulkLeadUpload([FromBody] List<LeadModel> leads)
        {
            var results = await _leadService.BulkLeadUpload(leads);
            return Ok(results);
        }

        [HttpPut("UpdateLead")]
        public async Task<ActionResult<bool>> UpdateLead([FromBody] LeadModel leadModel)
        {
            await _leadService.UpdateLead(leadModel);
            return Ok(true);
        }

        [HttpGet("GetLeadPersonByIdNumber/{idNumber}")]
        public async Task<ActionResult<LeadPerson>> GetLeadPersonById(string idNumber)
        {
            var leadPerson = await _leadService.GetLeadPersonByIdNumber(idNumber);
            return Ok(leadPerson);
        }

        [HttpGet("GetLeadCompanyByRegistrationNumber/{registrationNumber}")]
        public async Task<ActionResult<LeadCompany>> GetLeadCompanyByRegistrationNumber(string registrationNumber)
        {
            var leadCompany = await _leadService.GetLeadCompanyByRegistrationNumber(registrationNumber);
            return Ok(leadCompany);
        }

        [HttpGet("GetLeadCompanyByCFReferenceNumber/{cfReferenceNumber}")]
        public async Task<ActionResult<LeadCompany>> GetLeadCompanyByCFReferenceNumber(string cfReferenceNumber)
        {
            var leadCompany = await _leadService.GetLeadCompanyByCFReferenceNumber(cfReferenceNumber);
            return Ok(leadCompany);
        }

        [HttpGet("GetLeadCompanyByCFRegistrationNumber/{cfRegistrationNumber}")]
        public async Task<ActionResult<LeadCompany>> GetLeadCompanyByCFRegistrationNumber(string cfRegistrationNumber)
        {
            var leadCompany = await _leadService.GetLeadCompanyByCFRegistrationNumber(cfRegistrationNumber);
            return Ok(leadCompany);
        }

        [HttpGet("GetPagedLeadsBasic/{leadStatusId}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<LeadModel>>> GetPagedLeadsBasic(int leadStatusId, int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var leads = await _leadService.GetPagedLeadsBasic(leadStatusId, new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(leads);
        }

        [HttpGet("GetPagedLeadNotes/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<LeadNote>>> GetPagedLeadNotes(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var leadNotes = await _leadService.GetPagedLeadNotes(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(leadNotes);
        }

        [HttpPost("AddLeadNote")]
        public async Task<ActionResult<int>> AddLeadNote([FromBody] LeadNote leadNote)
        {
            var id = await _leadService.AddLeadNote(leadNote);
            return Ok(id);
        }

        [HttpPut("EditLeadNote")]
        public async Task<ActionResult> EditLeadNote([FromBody] LeadNote leadNote)
        {
            await _leadService.EditLeadNote(leadNote);
            return Ok();
        }

        [HttpGet("GetPagedLeadContactsV2/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<LeadNote>>> GetPagedLeadContactsV2(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var leadContactsV2 = await _leadService.GetPagedLeadContactsV2(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(leadContactsV2);
        }

        [HttpPost("AddLeadContactV2")]
        public async Task<ActionResult<int>> AddLeadContactV2([FromBody] LeadContactV2 leadContactV2)
        {
            var id = await _leadService.AddLeadContactV2(leadContactV2);
            return Ok(id);
        }

        [HttpPut("EditLeadContactV2")]
        public async Task<ActionResult> EditLeadContactV2([FromBody] LeadContactV2 leadContactV2)
        {
            await _leadService.EditLeadContactV2(leadContactV2);
            return Ok();
        }

        [HttpGet("GetPagedLeadAddresses/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<LeadNote>>> GetPagedLeadAddresses(int page = 1, int pageSize = 1, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var leadAddresses = await _leadService.GetPagedLeadAddresses(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(leadAddresses);
        }

        [HttpPost("AddLeadAddress")]
        public async Task<ActionResult<int>> AddLeadAddress([FromBody] LeadAddress leadAddress)
        {
            var id = await _leadService.AddLeadAddress(leadAddress);
            return Ok(id);
        }

        [HttpPut("EditLeadAddress")]
        public async Task<ActionResult> EditLeadAddress([FromBody] LeadAddress leadAddress)
        {
            await _leadService.EditLeadAddress(leadAddress);
            return Ok();
        }
    }
}