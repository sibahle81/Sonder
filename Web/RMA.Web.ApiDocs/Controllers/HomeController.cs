using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RMA.Web.ApiDocs.Controllers
{
    public class Home : Controller
    {
        [AllowAnonymous]
        public IActionResult Index()
        {
            return Redirect("~/swagger/index.html");
        }
    }
}
