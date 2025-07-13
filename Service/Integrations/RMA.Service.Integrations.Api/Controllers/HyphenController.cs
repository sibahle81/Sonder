using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Integrations.Contracts.Entities.Hyphen;
using RMA.Service.Integrations.Contracts.Interfaces.Hyphen;

using System.Threading.Tasks;

namespace RMA.Service.Integrations.Api.Controllers
{
    public class HyphenController : RmaApiController
    {
        private readonly IHyphenAccountVerificationService _hyphenAccountVerificationService;

        public HyphenController(IHyphenAccountVerificationService hyphenAccountVerificationService)
        {
            _hyphenAccountVerificationService = hyphenAccountVerificationService;
        }

        [HttpPost("VerifyAccount/{accountNo}/{accountType}/{branchCode}/{initials}/{lastName}/{idNumber}")]
        public async Task<ActionResult<RootHyphenVerificationResult>> VerifyAccount(string accountNo, BankAccountTypeEnum accountType, string branchCode, string initials, string lastName, string idNumber)
        {
            var verificationResult = await _hyphenAccountVerificationService.VerifyAccount(accountNo, accountType, branchCode, initials, lastName, idNumber);
            return Ok(verificationResult);
        }
    }
}