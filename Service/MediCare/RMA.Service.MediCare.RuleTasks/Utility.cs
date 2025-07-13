using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;

namespace RMA.Service.MediCare.RuleTasks
{
    public static class Utility
    {
        public static string GetEnumDisplayName(this Enum enumType)
        {
            if (enumType != null)
                return enumType.GetType().GetMember(enumType.ToString())
                           .First()
                           .GetCustomAttribute<DisplayAttribute>()
                           .Name;
            else
                return string.Empty;
        }
    }
}
