using Microsoft.AspNetCore.Routing;

namespace RMA.Common.Web.Extensions
{
    public static class RouteExtensions
    {
        public static string Controller(this RouteData routeData)
        {
            var routeValueDictionary = routeData?.Values;
            return routeValueDictionary["controller"].ToString();
        }

        public static string Action(this RouteData routeData)
        {
            var routeValueDictionary = routeData?.Values;
            return routeValueDictionary["action"].ToString();
        }

        public static string Area(this RouteData routeData)
        {
            var routeValueDictionary = routeData?.Values;
            return routeValueDictionary["area"].ToString();
        }
    }
}