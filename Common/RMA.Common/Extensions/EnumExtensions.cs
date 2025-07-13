using Newtonsoft.Json.Linq;
using RMA.Common.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;

namespace RMA.Common.Extensions
{
    public static class EnumHelper
    {
        public static string DisplayAttributeValue<T>(this T enumValue)
        {
            var enumType = enumValue.GetType();
            if (!enumType.IsEnum) throw new ArgumentException("T must be an enumerated type");
            var value = enumType.GetMember(enumValue.ToString()).FirstOrDefault();
            if (value == null) return string.Empty;
            return GetDisplayName(value);
        }

        public static string GetDisplayName(MemberInfo field)
        {
            if (field == null)
            {
                throw new ArgumentNullException(nameof(field), "field is null");
            }
            var display = field.GetCustomAttribute<DisplayAttribute>(false);
            if (display != null)
            {
                var name = display.GetName();
                if (!string.IsNullOrEmpty(name)) return name;
            }

            return field.Name;
        }

        public static string GroupByAttributeValue<T>(this T enumValue)
        {
            var enumType = enumValue.GetType();
            if (!enumType.IsEnum) throw new ArgumentException("T must be an enumerated type");
            var value = enumType.GetMember(enumValue.ToString()).FirstOrDefault();
            if (value == null) return string.Empty;
            return GetGroupByName(value);
        }

        public static string GetGroupByName(MemberInfo field)
        {
            if (field == null)
            {
                throw new ArgumentNullException(nameof(field), "field is null");
            }
            var display = field.GetCustomAttribute<DisplayAttribute>(false);
            if (display != null)
            {
                var name = display.GetGroupName();
                if (!string.IsNullOrEmpty(name)) return name;
            }

            return field.Name;
        }

        public static string DisplayDescriptionAttributeValue<T>(this T enumValue)
        {
            var enumType = enumValue.GetType();
            if (!enumType.IsEnum) throw new ArgumentException("T must be an enumerated type");
            var value = enumType.GetMember(enumValue.ToString()).FirstOrDefault();
            if (value == null) return string.Empty;
            return GetDisplayDescription(value);
        }

        public static string GetDisplayDescription(MemberInfo field)
        {
            if (field == null)
            {
                throw new ArgumentNullException(nameof(field), "field is null");
            }
            var display = field.GetCustomAttribute<DisplayAttribute>(false);
            if (display != null)
            {
                var description = display.GetDescription();
                if (!string.IsNullOrEmpty(description)) return description;
            }

            return field.Name;
        }

        public static IList<T> ToList<T>()
        {
            var enumType = typeof(T);
            return enumType.GetFields(BindingFlags.Static | BindingFlags.Public)
                .Select(fi => (T)Enum.Parse(enumType, fi.Name, false)).ToList();
        }

        public static IList<string> EnumToList(this Type type)
        {
            if (type == null)
            {
                throw new ArgumentNullException(nameof(type), "type is null");
            }
            if (!type.IsEnum) throw new ArgumentException("type must be an enum", nameof(type));

            var list = new List<string>();
            var type2 = Nullable.GetUnderlyingType(type) ?? type;

            foreach (var info in type2.GetFields(BindingFlags.GetField | BindingFlags.Public | BindingFlags.Static |
                                                 BindingFlags.DeclaredOnly))
            {
                list.Add(GetDisplayName(info));
            }

            return list.OrderBy(d => d).ToList();
        }

        public static List<Lookup> ToLookupList(this Type enumType)
        {
            if (enumType == null)
            {
                throw new ArgumentNullException(nameof(enumType), "enumType is null");
            }
            if (!enumType.IsEnum) throw new ArgumentException("type must be an enum", nameof(enumType));

            List<Lookup> list = new List<Lookup>();
            var names = enumType.GetFields(BindingFlags.Static | BindingFlags.Public).Select(fi => fi.Name).ToList();

            foreach (string info in names)
            {
                var enumItem = Enum.Parse(enumType, info);
                list.Add(new Lookup()
                {
                    Id = (int)enumItem,
                    Name = enumItem.DisplayAttributeValue(),
                    Description = enumItem.DisplayAttributeValue()
                });
            }

            return list.OrderBy(d => d.Name).ToList();
        }

        public static T Parse<T>(string value)
        {
            return (T)Enum.Parse(typeof(T), value, true);
        }

        public static IList<string> GetNames(Enum value)
        {
            if (value == null)
            {
                throw new ArgumentNullException(nameof(value), "value is null");
            }
            return value.GetType().GetFields(BindingFlags.Static | BindingFlags.Public).Select(fi => fi.Name).ToList();
        }

        public static string GetDescription(this Enum genericEnum)
        {
            if (genericEnum == null)
            {
                throw new ArgumentNullException(nameof(genericEnum), "genericEnum is null");
            }
            var genericEnumType = genericEnum.GetType();
            var memberInfo = genericEnumType.GetMember(genericEnum.ToString());
            if (memberInfo.Length <= 0) return genericEnum.ToString();
            var attributes =
                memberInfo[0].GetCustomAttributes(typeof(DescriptionAttribute), false);

            return attributes.Length > 0
                ? ((DescriptionAttribute)attributes[0]).Description
                : genericEnum.ToString();
        }

        public static T GetEnumValueFromDisplayName<T>(string displayName) where T : Enum
        {
            var type = typeof(T);
            foreach (var field in type.GetFields())
            {
                var attribute = field.GetCustomAttributes(typeof(DisplayAttribute), false)
                    .FirstOrDefault() as DisplayAttribute;
                if (attribute != null && string.Equals(attribute.Name, displayName, StringComparison.OrdinalIgnoreCase))
                {
                    return (T)field.GetValue(null);
                }
            }
            throw new ArgumentException($"No enum value with display name '{displayName}' found in {type.Name}");
        }
    }
}