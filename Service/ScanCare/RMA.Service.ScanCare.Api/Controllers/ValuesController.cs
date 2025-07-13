using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;

using System.Collections.Generic;

namespace RMA.Service.ScanCare.Api.Controllers
{
    public class ValuesController : RmaApiController
    {
        // GET api/values
        [HttpGet]
        public ActionResult<IEnumerable<string>> Get()
        {
            return new string[] { "value1", "value2" };
        }
    }
}
