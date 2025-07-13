using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class DocumentTemplateController : RmaApiController
    {
        public DocumentTemplateController()
        {
        }

        // POST: mdm/Api/DocumentTemplate
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] string templateName)
        {
            return Ok();
        }

        // GET: mdm/Api/DocumentTemplate/{name}
        [HttpGet("{name}")]
        public async Task<ActionResult> Get(string name)
        {
            return Ok();
        }
      
    }
}