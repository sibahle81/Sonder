using Microsoft.AspNetCore.Mvc;

namespace RMA.Web.Login.Controllers
{
    public class Home : Controller
    {
        public IActionResult Index()
        {
            return View("SignIn");
        }
    }
}
