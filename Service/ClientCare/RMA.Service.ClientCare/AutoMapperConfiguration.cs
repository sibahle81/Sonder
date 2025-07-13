using AutoMapper;

using RMA.Service.ClientCare.Mappers;

namespace RMA.Service.ClientCare
{
    public static class AutoMapperConfiguration
    {
        private static bool _isInit;

        public static void Configure()
        {
            if (_isInit) return;

            Mapper.Initialize(profile =>
            {
                profile.AddProfile<ClientMappingProfile>();
                profile.AddProfile<PolicyMapperProfile>();
                profile.AddProfile<LeadMapperProfile>();
                profile.AddProfile<QuoteMapperProfile>();
                profile.AddProfile<ProductMappingProfile>();
                profile.AddProfile<BrokerMappingProfile>();
                profile.AddProfile<RolePlayerMappingProfile>();
                profile.AddProfile<PremiumListingProfile>();
            });
            Mapper.Configuration.AssertConfigurationIsValid();

            _isInit = true;
        }
    }
}
