using AutoMapper;

namespace RMA.Common.Extensions
{
    public static class AutoMapperExtensions
    {
        public static void IgnoreIfSourceIsNull<TSource, TDestination, TMember>(
            this IMemberConfigurationExpression<TSource, TDestination, TMember> expression)
        {
            expression?.Condition((src, dest, sMember, dMember) => sMember != null && src != null);
        }

        public static void TreatEmptyStringsAsNull<TSource, TDestination, TMember>(
            IMemberConfigurationExpression<TSource, TDestination, TMember> expression)
        {
            expression?.Condition(ctx => ctx.GetType() != typeof(string) || !string.IsNullOrEmpty(ctx.ToString()));
        }
    }
}