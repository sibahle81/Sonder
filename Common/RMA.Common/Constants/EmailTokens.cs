namespace RMA.Common.Constants
{
    public static class EmailTokens
    {
        public const string Initials = "[Initials]";
        public const string Surname = "[Surname]";

        /** We chose not to implement the property name changes, as they would significantly affect critical areas of the project. **/
#pragma warning disable CA1707 // Identifiers should not contain underscores
        public const string Insured_Life = "[Insured_Life]";
        public const string AddressLine1 = "[AddressLine1]";
        public const string AddressLine2 = "[AddressLine2]";
        public const string Claims_No = "[Claims_No]";
#pragma warning restore CA1707 // Identifiers should not contain underscores
        public const string City = "[City]";
        public const string PostalCode = "[PostalCode]";
    }
}