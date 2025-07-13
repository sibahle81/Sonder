using System;
using System.Reflection;

namespace RMA.Common.Extensions
{
    public static class TypeExtensions
    {
        public static bool IsNullable(this Type type)
        {
            if (type == null) throw new ArgumentNullException(nameof(type), "type is null");
            if (type.GetTypeInfo().IsGenericType)
                return type.GetGenericTypeDefinition() == typeof(Nullable<>);
            return false;
        }

        public static bool IsAssignableTo(this Type type, Type assignableType)
        {
            if (assignableType == null) throw new ArgumentNullException(nameof(assignableType), "assignableType is null");
            return assignableType.IsAssignableFrom(type);
        }

        public static bool IsAssignableTo<TAssignable>(this Type type)
        {
            return IsAssignableTo(type, typeof(TAssignable));
        }
    }
}