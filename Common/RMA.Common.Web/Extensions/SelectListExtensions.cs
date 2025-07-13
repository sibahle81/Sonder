using Microsoft.AspNetCore.Mvc.Rendering;

using RMA.Common.Extensions;

using System;
using System.Collections.Generic;
using System.Reflection;

namespace RMA.Common.Web.Extensions
{
    public static class SelectListExtensions
    {
        public static IList<SelectListItem> ToSelectList(this Enum value)
        {
            var type = value?.GetType();
            return ToSelectList(type);
        }

        public static IList<SelectListItem> ToSelectList(this Type type)
        {
            if (type == null) throw new ArgumentNullException(nameof(type), "type is null");
            if (!type.IsEnum) throw new ArgumentException("type must be an enum", nameof(type));

            IList<SelectListItem> list = new List<SelectListItem>();
            var type2 = Nullable.GetUnderlyingType(type) ?? type;
            if (type2 != type)
            {
                var item = new SelectListItem
                {
                    Text = string.Empty,
                    Value = string.Empty
                };
                list.Add(item);
            }

            foreach (var info in type2.GetFields(BindingFlags.GetField | BindingFlags.Public | BindingFlags.Static
                                                 | BindingFlags.DeclaredOnly))
            {
                var rawConstantValue = info.GetRawConstantValue();
                var item2 = new SelectListItem
                {
                    Text = EnumHelper.GetDisplayName(info),
                    Value = rawConstantValue.ToString()
                };
                list.Add(item2);
            }

            return list;
        }
    }
}