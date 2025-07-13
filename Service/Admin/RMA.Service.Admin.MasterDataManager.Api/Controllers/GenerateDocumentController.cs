using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

using RMA.Common.Web.Controllers;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;

using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class GenerateDocumentController : RmaApiController
    {
        private readonly IDocumentGeneratorService _documentGenerator;
        private readonly IDocumentTemplateService _documentTemplateRepository;

        public GenerateDocumentController(IDocumentGeneratorService documentGenerator,
            IDocumentTemplateService documentTemplateRepository)
        {
            _documentGenerator = documentGenerator;
            _documentTemplateRepository = documentTemplateRepository;
        }

        // POST: mdm/api/GenerateDocument/{request}
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] FormLetterRequest request)
        {
            if (request != null)
            {
                var response = new FormLetterResponse(request);
                var template = await _documentTemplateRepository.GetDocumentTemplateById((int)request.DocumentTypeId);
                var xmlData = JsonConvert.DeserializeXmlNode(request.JsonDocumentData, template.Name);
                var byteData = await _documentGenerator.GetFileByteData(template.Location);
                response.ByteData = await _documentGenerator.GenerateDocument(byteData, xmlData.OuterXml);
            }
            return Ok();
        }

        // GET: mdm/api/GenerateCode/{documentNumberType}}
        [HttpGet("GenerateCode")]
        public async Task<ActionResult<string>> GenerateCode([FromQuery] string documentNumberType, [FromQuery] long identifier)
        {
            var type = (Contracts.Enums.DocumentNumberTypeEnum)System.Enum.Parse(typeof(Contracts.Enums.DocumentNumberTypeEnum), documentNumberType);
            var code = await _documentGenerator.GenerateDocumentNumber(type, "");
            return Ok(code);
        }
    }
}