using Microsoft.AspNetCore.Mvc.Rendering;

namespace RMA.Common.Web.Extensions
{
    public static class ViewContextExtensions
    {
        public static string Area(this ViewContext context)
        {
            return context?.RouteData.Area();
        }

        public static string Controller(this ViewContext context)
        {
            return context?.RouteData.Controller();
        }

        public static string Action(this ViewContext context)
        {
            return context?.RouteData.Action();
        }
    }
}