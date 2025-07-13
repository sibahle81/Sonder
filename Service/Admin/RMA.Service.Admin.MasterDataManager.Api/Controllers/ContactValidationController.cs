using Microsoft.AspNetCore.Mvc;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class ContactValidationController : RmaApiController
    {
        private readonly IContactValidationService _contactValidationService;

        public ContactValidationController(IContactValidationService contactValidationService )
        {
            _contactValidationService = contactValidationService;
        }

        // GET: mdm/api/ContactValidation
        [HttpGet("GetMobileNoPrefixes/{countrycode}")]
        public async Task<ActionResult<string>> GetMobileNoPrefixes(string countryCode)
        {
            var result = await _contactValidationService.GetCellPhonePrefixes(countryCode);
            return Ok(result);
        }

        [HttpGet("GetMobileNoPrefixesForRSA")]
        public async Task<ActionResult<string>> GetMobileNoPrefixesForRSA()
        {
            var result = await _contactValidationService.GetCellPhonePrefixesForRSA();
            return Ok(result);
        }

        [HttpGet("ValidateEmailAddress/{email}")]
        public async Task<ActionResult<EmailInfo>> ValidateEmailAddress(string email)
        {
            var result = await _contactValidationService.ValidateEmailAddress(email);
            return Ok(result);
        }

        [HttpGet("ValidateEmailAddresses/{emails}")]
        public async Task<ActionResult<IEnumerable<EmailInfo>>> ValidateEmailAddresses(string emails)
        {
            var EmailsInfo = new List<EmailInfo>();

            if (emails != null)
            {
                var emailList = emails.Split(';').ToList<string>();
                return await _contactValidationService.ValidateEmailAddresses(emailList);

            }

            return Ok(EmailsInfo);
        }

    }
}