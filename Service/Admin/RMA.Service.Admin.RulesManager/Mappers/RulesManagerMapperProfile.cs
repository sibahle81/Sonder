using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.Admin.RulesManager.Database.Entities;

namespace RMA.Service.Admin.RulesManager.Mappers
{
    public class RulesManagerMapperProfile : Profile
    {
        /// <summary>
        ///     Create the mappers that map the database types to the contract types
        /// </summary>
        public RulesManagerMapperProfile()
        {
            CreateMap<rules_Rule, Rule>()
                .ForMember(s => s.DateViewed, opt => opt.Ignore())
                .ForMember(s => s.RuleTypeId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<rules_Rule>(s.Id));
        }
    }
}