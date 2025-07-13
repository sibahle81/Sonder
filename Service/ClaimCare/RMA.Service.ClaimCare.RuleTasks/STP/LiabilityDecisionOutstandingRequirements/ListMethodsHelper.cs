using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;

namespace RMA.Service.ClaimCare.RuleTasks.STP.LiabilityDecisionOutstandingRequirements
{
    public static class ListMethodsHelper
    {
        public static IList<T> GetValues<T>()
        {
            IList<T> list = new List<T>();
            foreach (object value in Enum.GetValues(typeof(T)))
            {
                list.Add((T)value);
            }
            return list;
        }

        public static string WithEnumDescription<T>(Enum value)
        {
            if (value == null)
            {
                throw new ArgumentNullException(nameof(value));
            }

            Type enumType = typeof(T);
            MemberInfo[] memberInfos = enumType.GetMember(value.ToString());
            if (memberInfos.Length == 0)
            {
                return "";
            }

            MemberInfo memberInfo = memberInfos[0];
            var descriptionAttribute = memberInfo.GetCustomAttribute<DescriptionAttribute>();

            return descriptionAttribute?.Description ?? "";
        }
    }
}
