using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RMA.Common.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public abstract class RmaApiController : ControllerBase
    {
    }
}