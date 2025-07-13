namespace RMA.Common.Extensions
{
    public static class NullableIntExtension
    {
        public static int IntValue(this int? valueInt)
        {
            return valueInt.HasValue ? valueInt.Value : 0;
        }
    }
}