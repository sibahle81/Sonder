using Microsoft.AspNetCore.Mvc;

namespace RMA.Common.Web.Extensions
{
    public static class ControllerExtensions
    {
        public static string Area(this Controller controller)
        {
            return controller?.RouteData.Area();
        }

        public static string Controller(this Controller controller)
        {
            return controller?.RouteData.Controller();
        }

        public static string Action(this Controller controller)
        {
            return controller?.RouteData.Action();
        }
    }
}