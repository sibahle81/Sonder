using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Database.Entities;

namespace RMA.Service.ClientCare.Mappers
{
    public class QuoteMapperProfile : Profile
    {
        public QuoteMapperProfile()
        {
            CreateMap<quote_Quote, Quote>()
                .ForMember(s => s.Id, opt => opt.MapFrom(d => d.QuoteId))
                .ForMember(m => m.IsActive, opt => opt.Ignore())
                .ForMember(m => m.QuoteStatusId, opt => opt.Ignore())
                .ForMember(m => m.ProductId, opt => opt.Ignore())
                .ForMember(m => m.ProductOptionId, opt => opt.Ignore())
                .ForMember(m => m.CaseType, opt => opt.Ignore())
                .ForMember(m => m.ProductClass, opt => opt.Ignore())
                .ForMember(m => m.DependentQuotes, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(m => m.QuoteAllowances, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<quote_Quote>(s.QuoteId));

            CreateMap<quote_QuoteAllowance, QuoteAllowance>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<quote_QuoteAllowance>(s.QuoteAllowanceId));

            CreateMap<quote_QuoteV2, QuoteV2>()
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<quote_QuoteV2>(s.QuoteId));

            CreateMap<quote_QuoteDetailsV2, QuoteDetailsV2>()
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntityIncludeDeleted<quote_QuoteDetailsV2>(s.QuoteDetailId));
        }
    }
}
