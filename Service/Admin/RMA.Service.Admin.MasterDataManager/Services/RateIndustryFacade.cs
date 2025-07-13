using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class RateIndustryFacade : RemotingStatelessService, IRateIndustryService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_RateIndustry> _rateIndustryRepository;
        private readonly IMapper _mapper;

        public RateIndustryFacade(IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IRepository<common_RateIndustry> rateIndustryRepository,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _rateIndustryRepository = rateIndustryRepository;
            _mapper = mapper;
        }

        public async Task<List<RateIndustry>> GetIndustryRates(string industryGroup, SkillSubCategoryEnum skillSubCategory)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _rateIndustryRepository
                    .Where(rateIndustry => rateIndustry.IndustryGroup == industryGroup
                                           && rateIndustry.SkillSubCategory == skillSubCategory
                                           && !string.IsNullOrEmpty(rateIndustry.Industry))
                    .Select(rateIndustry => new RateIndustry
                    {
                        Id = rateIndustry.Id,
                        Industry = rateIndustry.Industry,
                        IndustryGroup = rateIndustry.IndustryGroup,
                        EmpCat = rateIndustry.EmployeeCategory,
                        SkillSubCategory = rateIndustry.SkillSubCategory,
                        IndRate = rateIndustry.IndustryRate,
                        PreviousYear = rateIndustry.PreviousYear,
                        PremiumPerMember = rateIndustry.PremiumPerMember
                    }).ToListAsync();
            }
        }

        public async Task<List<RateIndustry>> GetRateIndustries(string industryGroup)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _rateIndustryRepository
                    .Where(rateIndustry => rateIndustry.IndustryGroup == industryGroup)
                    .Select(rateIndustry => new RateIndustry
                    {
                        Id = rateIndustry.Id,
                        Industry = rateIndustry.Industry,
                        IndustryGroup = rateIndustry.IndustryGroup,
                        EmpCat = rateIndustry.EmployeeCategory,
                        SkillSubCategory = rateIndustry.SkillSubCategory,
                        IndRate = rateIndustry.IndustryRate,
                        PreviousYear = rateIndustry.PreviousYear,
                        PremiumPerMember = rateIndustry.PremiumPerMember
                    }).ToListAsync();
            }
        }

        public async Task<List<RateIndustry>> GetIndustryGroup()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _rateIndustryRepository
                    .Where(rateIndustry => rateIndustry.Id > 0)
                    .Select(rateIndustry => new RateIndustry
                    {
                        Id = rateIndustry.Id,
                        Industry = rateIndustry.Industry,
                        IndustryGroup = rateIndustry.IndustryGroup,
                        EmpCat = rateIndustry.EmployeeCategory,
                        SkillSubCategory = rateIndustry.SkillSubCategory,
                        IndRate = rateIndustry.IndustryRate,
                        PreviousYear = rateIndustry.PreviousYear,
                        PremiumPerMember = rateIndustry.PremiumPerMember
                    }).ToListAsync();
            }
        }

        public async Task<List<RateIndustry>> GetEmployeeCategories(string industry)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _rateIndustryRepository
                    .Where(rateIndustry => rateIndustry.Industry == industry)
                    .Select(rateIndustry => new RateIndustry
                    {
                        Id = rateIndustry.Id,
                        EmpCat = rateIndustry.EmployeeCategory
                    }).ToListAsync();
            }
        }

        public async Task<RateIndustry> GetRate(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _rateIndustryRepository
                    .Where(rateIndustry => rateIndustry.Id == id)
                    .Select(rateIndustry => new RateIndustry
                    {
                        Id = rateIndustry.Id,
                        Industry = rateIndustry.Industry,
                        IndustryGroup = rateIndustry.IndustryGroup,
                        EmpCat = rateIndustry.EmployeeCategory,
                        SkillSubCategory = rateIndustry.SkillSubCategory,
                        IndRate = rateIndustry.IndustryRate,
                        PreviousYear = rateIndustry.PreviousYear,
                        PremiumPerMember = rateIndustry.PremiumPerMember
                    }).SingleAsync();
            }
        }

        public async Task<List<RateIndustry>> GetPremium(string industry, string empCategory)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _rateIndustryRepository
                    .Where(rateIndustry =>
                        rateIndustry.Industry == industry && rateIndustry.EmployeeCategory == empCategory)
                    .Select(rateIndustry => new RateIndustry
                    {
                        Id = rateIndustry.Id,
                        PremiumPerMember = rateIndustry.PremiumPerMember
                    }).ToListAsync();
            }
        }

        public async Task<List<RateIndustry>> GetRates(string industryName, string IndustryGroup, int ratingYear)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var x = new Regex(@"\s+");
                var y = x.Replace(industryName, "");

                var z = new Regex(@"
                (?<=[A-Z])(?=[A-Z][a-z]) |
                 (?<=[^A-Z])(?=[A-Z]) |
                 (?<=[A-Za-z])(?=[^A-Za-z])", RegexOptions.IgnorePatternWhitespace);

                var formattedIndustryName = z.Replace(y, " ");

                var rateIndustries = await _rateIndustryRepository.Where(
                    s => s.Industry == formattedIndustryName
                    && s.IndustryGroup == IndustryGroup
                    && s.RatingYear == ratingYear)
                .Select(rateIndustry => new RateIndustry
                {
                    Id = rateIndustry.Id,
                    EmpCat = rateIndustry.EmployeeCategory,
                    IndRate = rateIndustry.IndustryRate,
                    Industry = rateIndustry.Industry,
                    IndustryGroup = rateIndustry.IndustryGroup,
                    LoadDate = rateIndustry.CreatedDate,
                    PremiumPerMember = rateIndustry.PremiumPerMember,
                    PreviousYear = rateIndustry.PreviousYear,
                    PreviousYearRate = rateIndustry.PreviousYearRate,
                    RatingYear = rateIndustry.RatingYear,
                    SkillSubCategory = rateIndustry.SkillSubCategory
                }).ToListAsync();

                return _mapper.Map<List<RateIndustry>>(rateIndustries);
            }
        }

        public async Task<List<RateIndustry>> GetRatesForIndustry(string industryName, string IndustryGroup)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var x = new Regex(@"\s+");
                var y = x.Replace(industryName, "");

                var z = new Regex(@"
                (?<=[A-Z])(?=[A-Z][a-z]) |
                 (?<=[^A-Z])(?=[A-Z]) |
                 (?<=[A-Za-z])(?=[^A-Za-z])", RegexOptions.IgnorePatternWhitespace);

                var formattedIndustryName = z.Replace(y, " ");

                var rateIndustries = await _rateIndustryRepository.Where(
                    s => s.Industry == formattedIndustryName
                    && s.IndustryGroup == IndustryGroup)
                .Select(rateIndustry => new RateIndustry
                {
                    Id = rateIndustry.Id,
                    EmpCat = rateIndustry.EmployeeCategory,
                    IndRate = rateIndustry.IndustryRate,
                    Industry = rateIndustry.Industry,
                    IndustryGroup = rateIndustry.IndustryGroup,
                    LoadDate = rateIndustry.CreatedDate,
                    PremiumPerMember = rateIndustry.PremiumPerMember,
                    PreviousYear = rateIndustry.PreviousYear,
                    PreviousYearRate = rateIndustry.PreviousYearRate,
                    RatingYear = rateIndustry.RatingYear,
                    SkillSubCategory = rateIndustry.SkillSubCategory
                }).ToListAsync();

                return _mapper.Map<List<RateIndustry>>(rateIndustries);
            }
        }
    }
}