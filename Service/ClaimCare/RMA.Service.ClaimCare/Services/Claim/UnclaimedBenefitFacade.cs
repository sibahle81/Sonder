using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClaimCare.Mappers;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class UnclaimedBenefitFacade : RemotingStatelessService, IUnclaimedBenefitService
    {
        #region Fields

        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        private readonly IRepository<claim_UnclaimedBenefitHeader> _unclaimedBenefitHeaderRepository;

        private readonly IRepository<claim_UnclaimedBenefitInterest> _unclaimedBenefitInterestRepository;

        #endregion

        #region Constructors and Destructors

        public UnclaimedBenefitFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<claim_UnclaimedBenefitInterest> unclaimedBenefitInterestRepository,
            IRepository<claim_UnclaimedBenefitHeader> unclaimedBenefitHeaderRepository)
            : base(context)
        {
            this._unclaimedBenefitInterestRepository = unclaimedBenefitInterestRepository;
            this._unclaimedBenefitHeaderRepository = unclaimedBenefitHeaderRepository;
            this._dbContextScopeFactory = dbContextScopeFactory;
        }

        #endregion

        #region Public Methods and Operators

        public async Task<bool> DeleteUnclaimedBenefitInterestById(int unclaimedBenefitInterestId)
        {
            using (var scope = this._dbContextScopeFactory.Create())
            {
                var interest = await this._unclaimedBenefitInterestRepository
                                   .FirstOrDefaultAsync(c =>
                                       c.UnclaimedBenefitInterestId == unclaimedBenefitInterestId);

                if (interest == null)
                {
                    throw new KeyNotFoundException("Not Found");
                }

                interest.IsDeleted = true;
                this._unclaimedBenefitInterestRepository.Update(interest);
                return true;
            }
        }

        public async Task<List<UnclaimedBenefitInterest>> GetAllUnclaimedBenefitInterest()
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                return await this._unclaimedBenefitInterestRepository
                           .Where(s => !s.IsDeleted)
                           .ProjectTo<UnclaimedBenefitInterest>().ToListAsync();
            }
        }

        public async Task<UnclaimedBenefitInterest> GetUnclaimedBenefitInterestById(int unclaimedBenefitInterestId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                return await this._unclaimedBenefitInterestRepository
                           .ProjectTo<UnclaimedBenefitInterest>()
                           .FirstOrDefaultAsync(benefit =>
                               benefit.UnclaimedBenefitInterestId == unclaimedBenefitInterestId);
            }
        }

        public async Task<UnclaimedBenefitInvestmentResult> GetUnclaimedBenefitAmout(
            double unclaimedBenefitAmount,
            DateTime startDate,
            DateTime endDate,
            double? investigationFeeAmount,
            DateTime? investigationFeeDate)
        {
            if (!investigationFeeAmount.HasValue)
            {
                investigationFeeAmount = 0;
            }

            if (!investigationFeeDate.HasValue)
            {
                investigationFeeDate = startDate;
            }

            ValidateUnclaimBenefits(
                unclaimedBenefitAmount,
                startDate,
                endDate,
                investigationFeeAmount,
                investigationFeeDate);

            const int firstOfTheMonth = 1;
            const int yearMonths = 12;
            const int numberOfDaysInAYear = 365;

            var startMonth = startDate.Month;
            var startYear = startDate.Year;
            var daysInStartMonth = DateTime.DaysInMonth(startYear, startMonth);

            var endMonth = endDate.Month;
            var endYear = endDate.Year;

            var investmentMonths = ((endYear - startYear) * yearMonths) + endMonth - startMonth + 1; // Investment period in months
            var timingFeePayment = 1;

            var investigationMonth = investigationFeeDate.Value.Month;
            var investigationYear = investigationFeeDate.Value.Year;
            var investigationStartDate = new DateTime(investigationYear, investigationMonth, firstOfTheMonth);
            var daysInInvestigationMonth = DateTime.DaysInMonth(investigationYear, investigationMonth);
            var investigationActualDate = investigationFeeDate.Value;
            var daysBeforeFeePayment = (investigationActualDate - investigationStartDate).Days;
            var daysAfterFeePayment = daysInInvestigationMonth - daysBeforeFeePayment;

            var proRataStartDate = new DateTime(startYear, startMonth, firstOfTheMonth);
            var proRataStartDays = Math.Abs((proRataStartDate - startDate).Days);
            var proRataRemainingDays = Math.Abs(daysInStartMonth - proRataStartDays);
            var startDateMonth = new DateTime(startYear, startMonth, firstOfTheMonth);

            var actualTimingFeePayment = (int)Math.Round((investigationStartDate - startDateMonth).Days
                                                   / Convert.ToDouble(numberOfDaysInAYear) * yearMonths) + 1;

            try
            {
                using (this._dbContextScopeFactory.CreateReadOnly())
                {
                    var exponent = 1.00 / 12.00;

                    var unclaimedBenefit = await this._unclaimedBenefitInterestRepository
                                               .FirstAsync(t => t.InvestmentPeriod == timingFeePayment);

                    var interestEarnedForTheMonth =
                        Math.Round(((double)unclaimedBenefit.CumulativeRate * unclaimedBenefitAmount) - unclaimedBenefitAmount, 2);

                    var amount = unclaimedBenefitAmount;
                    var interestFactor = 0.00;

                    if (startDate == investigationFeeDate || actualTimingFeePayment > 1)
                    {
                        interestFactor = FirstMonthInterestFactor(
                                                                    unclaimedBenefitAmount,
                                                                    proRataRemainingDays,
                                                                    interestEarnedForTheMonth,
                                                                    daysInStartMonth,
                                                                    out amount);
                    }
                    else
                    {
                        var feePayment = unclaimedBenefitAmount - investigationFeeAmount.Value;

                        if (daysAfterFeePayment != 0 && (endYear != investigationYear || endMonth != investigationMonth))
                        {
                            var interestFeeEarned =
                                ((Convert.ToDouble(unclaimedBenefit.IncrementalRate - 1) * feePayment) / daysInInvestigationMonth) * daysAfterFeePayment;

                            amount = feePayment + interestFeeEarned;
                            interestFactor = amount / unclaimedBenefitAmount;
                        }
                        else
                        {
                            if (proRataRemainingDays != 0)
                            {
                                var interestFeeEarned =
                                    ((Convert.ToDouble(unclaimedBenefit.IncrementalRate - 1) * feePayment) / daysInInvestigationMonth) * proRataRemainingDays;

                                amount = feePayment + interestFeeEarned;
                                interestFactor = amount / unclaimedBenefitAmount;
                            }
                        }
                    }

                    var calculatedAmounts = new List<CalculatedAmount>
                                                {
                                                    new CalculatedAmount
                                                        {
                                                             InvestmentPeriod = 1,
                                                             InterestFactor = interestFactor,
                                                             Amount = amount
                                                        }
                                                };

                    for (var j = timingFeePayment + 1; j <= investmentMonths; j++)
                    {
                        var unclaimedBenefitInterest = await this._unclaimedBenefitInterestRepository
                                                           .FirstOrDefaultAsync(t => t.InvestmentPeriod == j);

                        if (unclaimedBenefitInterest == null)
                        {
                            continue;
                        }

                        if (j == actualTimingFeePayment)
                        {
                            interestFactor = await this.InvestigationInterestFactor(
                                                 unclaimedBenefitAmount,
                                                 investigationFeeAmount,
                                                 calculatedAmounts,
                                                 j,
                                                 actualTimingFeePayment,
                                                 unclaimedBenefitInterest,
                                                 daysInInvestigationMonth,
                                                 daysBeforeFeePayment,
                                                 daysAfterFeePayment);

                            continue;
                        }

                        var baseExponent = (double)unclaimedBenefitInterest.Naca + 1;
                        interestFactor = Math.Pow(baseExponent, exponent) * interestFactor;
                        amount = unclaimedBenefitAmount * interestFactor;

                        calculatedAmounts.Add(
                            new CalculatedAmount
                            {
                                InvestmentPeriod = j,
                                InterestFactor = interestFactor,
                                Amount = amount,
                                IncrementalRate = (double)unclaimedBenefitInterest.IncrementalRate
                            });
                    }

                    var lastProRataEndDate = new DateTime(endYear, endMonth, firstOfTheMonth);
                    var lastProRataTotalDaysInMonth = DateTime.DaysInMonth(endYear, endMonth);
                    var totalMonth = (((endYear - startYear) * yearMonths) + endMonth) - startMonth;

                    var lastRemainingDays = Math.Abs((lastProRataEndDate - endDate).Days);
                    var totalInvestmentPeriod = lastRemainingDays == 0 ? totalMonth : totalMonth + 1;
                    CalculatedAmount result;

                    if (totalInvestmentPeriod == 1)
                    {
                        result = calculatedAmounts[0];

                        return new UnclaimedBenefitInvestmentResult
                        {
                            InvestmentReturn = Math.Round(Math.Round(result.Amount, 3), 2),
                            InterestEarned = result.InterestFactor,
                            Period = result.InvestmentPeriod
                        };
                    }

                    if (totalInvestmentPeriod != totalMonth)
                    {
                        var lastCalculatedAmount = calculatedAmounts[calculatedAmounts.Count - 1];
                        var initialLastCashFlow = new UnclaimedBenefitInvestmentResult
                        {
                            InvestmentReturn = Math.Round(Math.Round(lastCalculatedAmount.Amount, 3), 2),
                            InterestEarned = lastCalculatedAmount.InterestFactor,
                            Period = lastCalculatedAmount.InvestmentPeriod
                        };

                        var lastCashflow = await this.UnclaimedBenefitInvestmentResult(
                                   unclaimedBenefitAmount,
                                   calculatedAmounts,
                                   totalInvestmentPeriod,
                                   lastProRataTotalDaysInMonth,
                                   lastRemainingDays,
                                   daysAfterFeePayment);

                        return lastCalculatedAmount.Amount > lastCashflow.InvestmentReturn ? lastCashflow : initialLastCashFlow;
                    }

                    result = calculatedAmounts[calculatedAmounts.Count - 2];

                    return new UnclaimedBenefitInvestmentResult
                    {
                        InvestmentReturn = Math.Round(Math.Round(result.Amount, 3), 2),
                        InterestEarned = result.InterestFactor,
                        Period = result.InvestmentPeriod
                    };
                }
            }
            catch (Exception e)
            {
                e.LogApiException();
                throw;
            }
        }

        private async Task<UnclaimedBenefitInvestmentResult> UnclaimedBenefitInvestmentResult(
            double unclaimedBenefitAmount,
            List<CalculatedAmount> calculatedAmounts,
            int totalInvestmentPeriod,
            int lastProRataTotalDaysInMonth,
            int lastRemainingDays,
            int daysAfterFeePayment)
        {
            var secondLastIndex = 2;
            var previousCalculatedResults = calculatedAmounts[totalInvestmentPeriod - secondLastIndex];
            var lastAmountBeforeFinalAmount = previousCalculatedResults.Amount;
            var unclaimedBenefitInterest = await this._unclaimedBenefitInterestRepository
                                               .FirstOrDefaultAsync(t => t.InvestmentPeriod == totalInvestmentPeriod);

            var incrementalRate = (double)unclaimedBenefitInterest.IncrementalRate - 1; // from the formula
            var interestForRemainingDays = incrementalRate * lastAmountBeforeFinalAmount / lastProRataTotalDaysInMonth * lastRemainingDays;
            var finalAmount = interestForRemainingDays + lastAmountBeforeFinalAmount;
            finalAmount = Math.Round(Math.Round(finalAmount, 3), 2);
            var interestFactor = finalAmount / unclaimedBenefitAmount;

            return new UnclaimedBenefitInvestmentResult
            {
                InvestmentReturn = finalAmount,
                InterestEarned = interestFactor,
                Period = totalInvestmentPeriod
            };
        }

        private async Task<double> InvestigationInterestFactor(
            double unclaimedBenefitAmount,
            double? investigationFeeAmount,
            List<CalculatedAmount> calculatedAmounts,
            int j,
            int actualTimingFeePayment,
            claim_UnclaimedBenefitInterest unclaimedBenefitInterest,
            int daysInInvestigationMonth,
            int daysBeforeFeePayment,
            int daysAfterFeePayment)
        {
            if (!investigationFeeAmount.HasValue)
            {
                throw new NullReferenceException("Investigation amount cannot be null");
            }

            var calculatedAmount = calculatedAmounts[j - 2];
            claim_UnclaimedBenefitInterest unclaimedBenefit;

            var amount = 0.00;
            var interestEarnedBeforeFee = 0.00;
            var interestFactor = 0.00;

            if (daysBeforeFeePayment != 0)
            {
                unclaimedBenefit = await
                                      this._unclaimedBenefitInterestRepository
                                          .FirstAsync(t => t.InvestmentPeriod == (actualTimingFeePayment - 1));

                amount = calculatedAmount.Amount;

                var incrementalRate = Convert.ToDouble(unclaimedBenefit.IncrementalRate) - 1;
                interestEarnedBeforeFee = (incrementalRate * amount) / daysInInvestigationMonth * daysBeforeFeePayment;

                amount += interestEarnedBeforeFee;
                amount -= investigationFeeAmount.Value;

                unclaimedBenefit = await this._unclaimedBenefitInterestRepository
                                       .FirstAsync(t => t.InvestmentPeriod == actualTimingFeePayment);

                var interestEarnedAfterFee =
                    ((Convert.ToDouble(unclaimedBenefit.IncrementalRate) - 1) * amount)
                    / daysInInvestigationMonth * daysAfterFeePayment;

                amount += interestEarnedAfterFee;
                interestFactor = amount / unclaimedBenefitAmount;
            }
            else
            {
                unclaimedBenefit = await this._unclaimedBenefitInterestRepository
                                       .FirstAsync(t => t.InvestmentPeriod == actualTimingFeePayment);
                amount = calculatedAmount.Amount - investigationFeeAmount.Value;
                interestEarnedBeforeFee = (Convert.ToDouble(unclaimedBenefit.IncrementalRate) - 1) * amount;
                amount += interestEarnedBeforeFee;
                interestFactor = amount / unclaimedBenefitAmount;
            }

            calculatedAmounts.Add(
                new CalculatedAmount
                {
                    InvestmentPeriod = j,
                    InterestFactor = interestFactor,
                    Amount = amount,
                    IncrementalRate = (double)unclaimedBenefitInterest.IncrementalRate
                });

            return interestFactor;
        }

        private static double FirstMonthInterestFactor(
            double unclaimedBenefitAmount,
            int proRataRemainingDays,
            double interestEarnedForTheMonth,
            int daysInStartMonth,
            out double amount)
        {
            if (proRataRemainingDays != 0)
            {
                interestEarnedForTheMonth = interestEarnedForTheMonth / daysInStartMonth * proRataRemainingDays;
            }

            var firstMonthInterest = Math.Round(interestEarnedForTheMonth + unclaimedBenefitAmount, 3);
            var interestFactor = firstMonthInterest / unclaimedBenefitAmount;
            var accumulatedAmount = Math.Round(unclaimedBenefitAmount * interestFactor, 3);

            if (accumulatedAmount > firstMonthInterest)
            {
                interestFactor = firstMonthInterest / unclaimedBenefitAmount;
            }

            amount = accumulatedAmount;
            return interestFactor;
        }

        public async Task<bool> UpdateUnclaimendBenefitInterest(UnclaimedBenefitInterest unclaimedBenefitInterest)
        {
            using (var scope = this._dbContextScopeFactory.Create())
            {
                var interest = await this._unclaimedBenefitInterestRepository.FirstOrDefaultAsync(
                                   c => c.UnclaimedBenefitInterestId == unclaimedBenefitInterest.UnclaimedBenefitInterestId);

                if (interest == null)
                {
                    throw new KeyNotFoundException("Not Found");
                }

                interest = Mapper.Map(unclaimedBenefitInterest, interest);
                this._unclaimedBenefitInterestRepository.Update(interest);

                return true;
            }
        }

        public async Task<bool> UploadUnclaimedBenefitFile(FileUpload fileUpload)
        {
            if (fileUpload == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }

            if (string.IsNullOrEmpty(fileUpload.FileContent))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var decodedString = Convert.FromBase64String(fileUpload.FileContent);
            const int startingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, startingIndex, decodedString.Length);
            var commaDelimiter = ',';
            var newLine = "\n";

            var csvParserOptions = new CsvParserOptions(false, commaDelimiter);
            var csvMapper = new CsvUnclaimedBenefitMapping();
            var csvParser = new CsvParser<UnclaimedBenefitInterest>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });

            var results = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            try
            {
                var unClaimedBenefitHeader = new claim_UnclaimedBenefitHeader
                {
                    FileName = fileUpload.FileName,
                    FileType = FileTypeEnum.CSV
                };

                using (var scope = this._dbContextScopeFactory.Create())
                {
                    foreach (var result in results)
                    {
                        if (!result.IsValid)
                        {
                            continue;
                        }

                        var unClaimedBenefitInterest = result.Result;
                        var entity = Mapper.Map<claim_UnclaimedBenefitInterest>(unClaimedBenefitInterest);
                        unClaimedBenefitHeader.UnclaimedBenefitInterests.Add(entity);
                    }

                    this._unclaimedBenefitHeaderRepository.Create(unClaimedBenefitHeader);
                    await scope.SaveChangesAsync();
                }
            }
            catch (Exception e)
            {
                e.LogApiException();
                throw;
            }

            return true;
        }

        #endregion

        #region Other Methods

        private static void ValidateUnclaimBenefits(
            double unclaimedBenefitAmount,
            DateTime startDate,
            DateTime endDate,
            double? investigationFeeAmount,
            DateTime? investigationFeeDate)
        {
            if (unclaimedBenefitAmount < 0)
            {
                throw new Exception("Unclaimed benefit amount negative. Check amount!");
            }

            if (startDate > endDate)
            {
                throw new Exception("Start date later than end date. Check dates!");
            }

            if (investigationFeeAmount > 1000)
            {
                throw new Exception("InvestigationInterestFactor fee is greater than R1000. Check amount!");
            }

            if (investigationFeeAmount < 0)
            {
                throw new Exception("InvestigationInterestFactor fee is negative. Check amount!");
            }

            if (startDate > investigationFeeDate)
            {
                throw new Exception("In case investigation fee payment date is before Benefit start date. Check dates!");
            }

            if (investigationFeeDate > endDate)
            {
                throw new Exception("In case investigation fee payment date is after Benefit end date. Check investigation dates!");
            }
        }

        #endregion
    }
}