namespace RMA.Service.Admin.MasterDataManager.Database.Constants
{
    public static class DatabaseConstants
    {
        public const string GetMenuForUser = "common.GetMenuForUser @UserId";
        public const string GetBrokerageConfigOptionTypes = "product.GetBrokerageConfigOptionTypes @EffectiveDate, @BrokerType";
        public const string GetCellPhonePrefixes = "[common].[GetCellPhonePrefixes] @CountryCode";
        public const string GetEmailDomain = "[common].[GetEmailDomain] @domain";
        public const string GetEmailDomains = "[common].[GetEmailDomains] @DomainsList, @delimter";
        public const string AddEmailDomain = "[common].[AddEmailDomain] @domain, @IsValidDomainFormat, @IsResolvedDomain";
    }
}
