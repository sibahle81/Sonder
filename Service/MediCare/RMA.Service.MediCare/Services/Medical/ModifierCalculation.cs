using RMA.Service.MediCare.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using System.Collections.Generic;
using System;
using System.Diagnostics;
using System.Threading.Tasks;
using static System.Windows.Forms.VisualStyles.VisualStyleElement;
using System.Linq;
using System.Windows.Forms.VisualStyles;

namespace RMA.Service.MediCare.Services.Medical
{
    public static class ModifierCalculation
    {
        public static async Task<ModifierOutput> CalculateModifier0005(ModifierInput modifierInput)
        {
            int tariffTypeCount = 0; //countNRPLType[servDt] + countCOIDType[servDt]
            decimal previousLineTariffAmount = 0.0M;
            decimal previousLinesTotalAmount = 0.0M;
            decimal modifierAmount = 0.0M;

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_0005_CODE)
            {
                tariffTypeCount += 1;

                foreach (var invoiceLine in modifierInput.PreviousInvoiceLines)
                {
                    if (invoiceLine.HcpTariffCode == MediCareConstants.MODIFIER_0005_CODE)
                    {
                        tariffTypeCount++;
                    }
                    else
                    {
                        previousLinesTotalAmount = Convert.ToDecimal(invoiceLine.TotalTariffAmount);
                    }
                }

                if (tariffTypeCount == 0)
                {
                    modifierAmount = 0;
                }
                else
                {
                    previousLineTariffAmount = modifierInput.TariffAmount;
                    previousLinesTotalAmount = modifierInput.PreviousLinesTotalAmount;

                    if (tariffTypeCount == MediCareConstants.MODIFIER_0005_FIRST_COUNT)
                        modifierAmount = MediCareConstants.MODIFIER_0005_FIRST_PERCENT * previousLineTariffAmount;
                    else if (tariffTypeCount == MediCareConstants.MODIFIER_0005_SECOND_COUNT)
                        modifierAmount = MediCareConstants.MODIFIER_0005_SECOND_PERCENT * previousLineTariffAmount;
                    else if (tariffTypeCount == MediCareConstants.MODIFIER_0005_THIRD_COUNT)
                        modifierAmount = MediCareConstants.MODIFIER_0005_THIRD_PERCENT * previousLineTariffAmount;
                    else if (tariffTypeCount >= MediCareConstants.MODIFIER_0005_FOURTH_AND_MORE_COUNT)
                        modifierAmount = MediCareConstants.MODIFIER_0005_FOURTH_AND_MORE_PERCENT * previousLineTariffAmount;

                    if (previousLineTariffAmount > modifierAmount)
                    {
                        modifierAmount = Math.Round((previousLineTariffAmount - modifierAmount) * (-1), 2);
                    }
                    else
                    {
                        modifierAmount = 0;
                    }
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = MediCareConstants.MODIFIER_DEFAULT_QUANTITY };
        }

        public static async Task<ModifierOutput> CalculateModifier0009(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;

            // Tariff Amount for 0009 = 20% of Total tariff amount of each line item that falls within listed section and publication scope
            // or The minimum amount payable as per the tariff based unit cost in govt gazette = (36 units * Tariff Based Unit Cost)

            if (modifierInput != null && modifierInput.ModifierCode == "0009")
            {
                decimal previousLinesTotalAmount = modifierInput.PreviousLinesTotalAmount;
                modifierAmount = 0.2M * previousLinesTotalAmount; /* 20% of previous tarrifamt*/

                decimal amountPayableAsPerGazette = MediCareConstants.MODIFIER_0009_DEFAULT_CLINICAL_UNITS * modifierInput.UnitPrice;

                modifierAmount = modifierAmount > amountPayableAsPerGazette ? modifierAmount : amountPayableAsPerGazette;
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = MediCareConstants.MODIFIER_DEFAULT_QUANTITY };
        }

        public static async Task<ModifierOutput> CalculateModifier0023(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;

            if (modifierInput != null && modifierInput.ModifierCode == "0023" && modifierInput.TariffBaseUnitCostTypeId == MediCareConstants.ANAESTHETIC)
            {
                int timeMinute = MediCareConstants.MODIFIER_0023_ANAESTHETIC_TIME_MINUTE;
                int anaesthesiaPerHour = MediCareConstants.MODIFIER_0023_ANAESTHESIA_PER_HOUR;

                var timeSpan = modifierInput.TimeUnits / timeMinute;
                if (modifierInput.TimeUnits % timeMinute > 0)
                    timeSpan += 1;

                if (timeSpan <= anaesthesiaPerHour)
                    totalUnits = MediCareConstants.MODIFIER_0023_15_MINS_UPTO_1_HRS * timeSpan;
                if (timeSpan > anaesthesiaPerHour)
                    totalUnits = MediCareConstants.MODIFIER_0023_15_MINS_UPTO_1_HRS * anaesthesiaPerHour + MediCareConstants.MODIFIER_0023_AFTER_1_HRS_EACH_15_MINS * (timeSpan - anaesthesiaPerHour);

                modifierAmount = totalUnits * modifierInput.UnitPrice;
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier0036(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal modifierQuantity = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            bool isanaestheticProcedure = false;
            decimal anaestheticUnits = 0;

            if (modifierInput != null)
            {
                foreach (var invoiceLine in modifierInput.PreviousInvoiceLines)
                {
                    if (invoiceLine.TariffBaseUnitCostTypeId != null && invoiceLine.TariffBaseUnitCostTypeId == MediCareConstants.ANAESTHETIC)
                    {
                        isanaestheticProcedure = true;
                        decimal recommendedUnits;
                        if (invoiceLine.IsModifier != null && !invoiceLine.IsModifier.Value)
                            recommendedUnits = modifierInput.TariffQuantity;
                        else
                            recommendedUnits = Convert.ToDecimal(invoiceLine.RequestedQuantity);
                        anaestheticUnits += recommendedUnits;
                    }
                }

                if (modifierInput.ModifierCode == MediCareConstants.MODIFIER_0036_CODE
                    && (modifierInput.PractitionerTypeId == MediCareConstants.GP || modifierInput.PractitionerTypeId == MediCareConstants.GP_CONSULT))
                {
                    decimal timeUnits = 0.0M;
                    int totalTime = modifierInput.TimeUnits;
                    var timeSpan = totalTime / 15;
                    if (modifierInput.TimeUnits % 15 > 0)
                        timeSpan += 1;

                    if (timeSpan <= 4)
                        timeUnits = MediCareConstants.MODIFIER_0036_15_MINS_UPTO_1_HRS * timeSpan;
                    else
                        timeUnits = MediCareConstants.MODIFIER_0036_15_MINS_UPTO_1_HRS * 4 + MediCareConstants.MODIFIER_0036_AFTER_1_HRS_EACH_15_MINS * (timeSpan - 4);

                    if (anaestheticUnits != 0)
                    {
                        totalUnits = anaestheticUnits + timeUnits;
                    }
                    else
                        totalUnits = 0;

                    if (totalTime <= MediCareConstants.FIRST_HOUR_MINUTES)
                    {
                        modifierAmount = MediCareConstants.MODIFIER_0036_ANEASTHETIC_MIN_UNITS * modifierInput.UnitPrice;
                        modifierQuantity = MediCareConstants.MODIFIER_0036_ANEASTHETIC_MIN_UNITS;
                    }
                    else
                    {
                        var secondHourUnits = (totalUnits - anaestheticUnits) - (MediCareConstants.MODIFIER_0036_15_MINS_UPTO_1_HRS * MediCareConstants.FIFTEEN_MINUTES_SPAN_IN_ONE_HOUR);
                        var firstHourUnits = MediCareConstants.MODIFIER_0036_ANEASTHETIC_MIN_UNITS;
                        decimal modifierAmountValue = (secondHourUnits * (MediCareConstants.MODIFIER_0036_PERCENT * modifierInput.UnitPrice)) + (firstHourUnits * modifierInput.UnitPrice);
                        modifierAmount = modifierAmountValue;
                        modifierQuantity = secondHourUnits + firstHourUnits;
                    }
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = modifierQuantity };
        }

        public static async Task<ModifierOutput> CalculateModifier0011(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_0011_CODE)
            {
                if (modifierInput.PractitionerTypeId == MediCareConstants.ANEASTHETICS || modifierInput.PractitionerTypeId == MediCareConstants.GP)
                {
                    bool isAneastheticsTime = false;
                    foreach (var line in modifierInput.PreviousInvoiceLines)
                    {
                        if (line.HcpTariffCode == MediCareConstants.MODIFIER_0023_CODE || line.HcpTariffCode == MediCareConstants.MODIFIER_0036_CODE
                             || line.HcpTariffCode == MediCareConstants.MODIFIER_0035_CODE)
                        {
                            isAneastheticsTime = true;
                        }
                    }

                    if (isAneastheticsTime)
                    {
                        decimal timeRemainder = modifierInput.TimeUnits % MediCareConstants.HALF_HOUR;
                        int lineQuantity = modifierInput.TimeUnits / MediCareConstants.HALF_HOUR;
                        if (timeRemainder > 0)
                            lineQuantity++;

                        totalUnits = lineQuantity * MediCareConstants.MODIFIER_0011_30_MINS;

                        modifierAmount = totalUnits * modifierInput.UnitPrice;
                    }
                }
                else if (modifierInput.TariffBaseUnitCostTypeId == MediCareConstants.CLINICAL_PROCEDURES)
                {
                    decimal timeRemainder = modifierInput.TimeUnits % MediCareConstants.HALF_HOUR;
                    int lineQuantity = modifierInput.TimeUnits / MediCareConstants.HALF_HOUR;
                    if (timeRemainder > 0)
                        lineQuantity++;

                    totalUnits = lineQuantity * MediCareConstants.MODIFIER_0011_30_MINS;

                    modifierAmount = totalUnits * modifierInput.UnitPrice;
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier0006(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_0006_CODE)
            {
                if (modifierInput.PublicationId == MediCareConstants.P01)
                {
                    if (modifierInput.TariffCode == MediCareConstants.MODIFIER_0005_CODE && modifierInput.PreviousInvoiceLines != null)
                    {
                        int linesCount = modifierInput.PreviousInvoiceLines.Count;
                        if (linesCount >= 2)
                        {
                            var procedureAmount = modifierInput.PreviousInvoiceLines[linesCount - 1].TotalTariffAmount + modifierInput.PreviousInvoiceLines[linesCount - 2].TotalTariffAmount;
                            modifierAmount = -1 * MediCareConstants.MODIFIER_0006_TWENTY_FIVE_PERCENT * procedureAmount;
                        }
                    }
                    else
                    {
                        modifierAmount = -1 * MediCareConstants.MODIFIER_0006_TWENTY_FIVE_PERCENT * modifierInput.TariffAmount;
                    }
                }
                else if (modifierInput.PublicationId == MediCareConstants.P04 || modifierInput.PublicationId == MediCareConstants.P12)
                {
                    modifierAmount = MediCareConstants.MODIFIER_0006_FIFTY_PERCENT * modifierInput.TariffAmount;
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier0018(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal totalInvoiceAmountInclusive = 0.0M;

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_0018_CODE)
            {
                if (modifierInput.PublicationId == MediCareConstants.P01 && modifierInput.TariffCode != MediCareConstants.MODIFIER_0018_CODE && modifierInput.TariffCode != MediCareConstants.MODIFIER_0009_CODE)
                {
                    if(modifierInput.PractitionerTypeId == MediCareConstants.ANEASTHETICS || modifierInput.PractitionerTypeId == MediCareConstants.GP)
                    {
                        foreach (var line in modifierInput.PreviousInvoiceLines)
                        {
                            if (line.HcpTariffCode == MediCareConstants.MODIFIER_0023_CODE || line.HcpTariffCode == MediCareConstants.MODIFIER_0036_CODE)
                            {
                                totalInvoiceAmountInclusive += line.TotalTariffAmount;
                            }
                        }
                    }
                    else
                    {
                        foreach (var line in modifierInput.PreviousInvoiceLines)
                        {
                            if (line.HcpTariffCode != MediCareConstants.MODIFIER_0018_CODE && line.HcpTariffCode != MediCareConstants.MODIFIER_0009_CODE)
                            {
                                totalInvoiceAmountInclusive += line.TotalTariffAmount;
                            }
                            else
                            {
                                totalInvoiceAmountInclusive = 0.0M;
                                break;
                            }
                        }
                    }

                    modifierAmount = 0.5M * totalInvoiceAmountInclusive;
                    totalInvoiceAmountInclusive = modifierAmount;
                }
                else if (modifierInput.TariffTypeId == MediCareConstants.TariffType_NRPL && modifierInput.PublicationId == MediCareConstants.P12)
                {
                    modifierAmount = -0.5M * modifierInput.TariffAmount;

                    if (modifierInput.PreviousLinesTotalAmount >= modifierInput.TariffAmount)
                    {
                        totalInvoiceAmountInclusive = -1 * (modifierInput.TariffAmount + modifierAmount);
                    }
                    else
                    {
                        totalInvoiceAmountInclusive = (modifierInput.PreviousLinesTotalAmount < (-1 * modifierAmount)) ? 0.0M : ((modifierInput.PreviousLinesTotalAmount + modifierInput.TariffDiscount) - (modifierInput.TariffAmount + modifierAmount));
                    }
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits, TotalIncusiveAmount = totalInvoiceAmountInclusive };
        }

        public static async Task<ModifierOutput> CalculateModifier0084(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;

            if (modifierInput != null && modifierInput.ModifierCode == "0084" && modifierInput.PublicationId == MediCareConstants.P01 && modifierInput.TariffAmount != 0)
            {
                modifierAmount = modifierInput.UnitPrice;
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier0008(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal totalInvoiceAmountInclusive = 0.0M;

            if (modifierInput != null && modifierInput.ModifierCode == "0008" && modifierInput.PublicationId == MediCareConstants.P01 && modifierInput.TariffAmount != 0)
            {
                if (modifierInput.TariffTypeId == MediCareConstants.TariffType_NRPL && modifierInput.PublicationId == MediCareConstants.P12)
                {
                    modifierAmount = -0.5M * modifierInput.TariffAmount;

                    if (modifierInput.PreviousLinesTotalAmount >= modifierInput.TariffAmount)
                    {
                        totalInvoiceAmountInclusive = -1 * (modifierInput.TariffAmount + modifierAmount);
                    }
                    else
                    {
                        totalInvoiceAmountInclusive = (modifierInput.PreviousLinesTotalAmount < (-1 * modifierAmount)) ? 0.0M : -1 * ((modifierInput.PreviousLinesTotalAmount + modifierInput.TariffDiscount) - (modifierInput.TariffAmount + modifierAmount));
                    }
                }
                else
                {
                    foreach (var line in modifierInput.PreviousInvoiceLines)
                    {
                        if (line.HcpTariffCode != "0008" && line.HcpTariffCode != "0009" && modifierInput.PublicationId == MediCareConstants.P01)
                        {
                            totalInvoiceAmountInclusive += line.TotalTariffAmount;
                        }
                        else
                        {
                            totalInvoiceAmountInclusive = 0.0M;
                            break;
                        }
                    }

                    modifierAmount = (MediCareConstants.MODIFIER_0008_PERCENT * totalInvoiceAmountInclusive);
                    totalInvoiceAmountInclusive = modifierAmount;
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier0039(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal modifierQuantity = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            int modifierFirstHourMinutes = MediCareConstants.MODIFIER_0039_1HR_MINUTES;
            int modifierAfterHourMinutes = MediCareConstants.MODIFIER_0039_AFTERHR_MINUTES;

            if (modifierInput != null && modifierInput.ModifierCode == "0039")
            {
                if (modifierInput.TariffBaseUnitCostTypeId == MediCareConstants.ANAESTHETIC && modifierInput.PublicationId == MediCareConstants.P01)
                {
                    if (modifierInput.TimeUnits < modifierFirstHourMinutes)
                    {
                        modifierQuantity = MediCareConstants.MODIFIER_0039_UPTO_60_MINS;
                    }
                    else
                    {
                        modifierInput.TariffQuantity = modifierInput.TimeUnits - modifierFirstHourMinutes;
                        decimal remainder = modifierInput.TariffQuantity % modifierAfterHourMinutes;
                        modifierQuantity = (int)Math.Truncate(modifierInput.TariffQuantity / modifierAfterHourMinutes);
                        if (remainder > 0)
                        {
                            modifierQuantity = modifierQuantity + MediCareConstants.MODIFIER_0039_THEREAFTER_EACH_15_MINS;
                        }
                        modifierQuantity = modifierQuantity + MediCareConstants.MODIFIER_0039_UPTO_60_MINS;
                    }

                    modifierAmount = modifierInput.UnitPrice * modifierQuantity;
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = modifierQuantity };
        }

        public static async Task<ModifierOutput> CalculateModifier0001(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;

            if (modifierInput != null)
            {
                if (modifierInput.PublicationId == MediCareConstants.P01)
                {
                    modifierAmount = 0.5M * modifierInput.TariffAmount;
                }

                if(modifierInput.SectionNo == MediCareConstants.MODIFIER_0001_SectionNo)
                {
                    /* Calculate tariff amount as per cost of 100 radiological units*/
                    decimal tariffAmount100RadiologicalUnits = modifierInput.UnitPrice * MediCareConstants.MODIFIER_0001_DEFAULT_RADIOLOGICAL_UNITS;
                    modifierAmount = (modifierAmount < tariffAmount100RadiologicalUnits) ? modifierAmount : tariffAmount100RadiologicalUnits;
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier0075(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;

            if (modifierInput != null && modifierInput.ModifierCode == "0075" && modifierInput.PublicationId == MediCareConstants.P01 && modifierInput.TariffAmount != 0)
            {
                modifierAmount = modifierInput.UnitPrice * modifierInput.RecommendedUnits;
                totalUnits = modifierInput.RecommendedUnits;
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier0035(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal modifierQuantity = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            bool isanaestheticProcedure = false;
            decimal anaestheticUnits = 0;

            if (modifierInput != null)
            {
                foreach (var invoiceLine in modifierInput.PreviousInvoiceLines)
                {
                    if (invoiceLine.TariffBaseUnitCostTypeId != null && invoiceLine.TariffBaseUnitCostTypeId == MediCareConstants.ANAESTHETIC)
                    {
                        isanaestheticProcedure = true;
                        decimal recommendedUnits;
                        if (invoiceLine.IsModifier != null && !invoiceLine.IsModifier.Value)
                            recommendedUnits = modifierInput.TariffQuantity;
                        else
                            recommendedUnits = Convert.ToDecimal(invoiceLine.RequestedQuantity);
                        anaestheticUnits += recommendedUnits;
                    }
                }

                if (isanaestheticProcedure && anaestheticUnits != 0 && modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_0035_CODE
                    && (modifierInput.TariffBaseUnitCostTypeId == MediCareConstants.ANAESTHETIC || modifierInput.PractitionerTypeId == MediCareConstants.ANEASTHETICS))
                {
                    decimal timeUnits = 0.0M;
                    int totalTime = modifierInput.TimeUnits;
                    var timeSpan = totalTime / MediCareConstants.FIFTEEN_MINUTES;
                    if (modifierInput.TimeUnits % MediCareConstants.FIFTEEN_MINUTES > 0)
                        timeSpan += 1;

                    if (timeSpan <= MediCareConstants.FIFTEEN_MINUTES_SPAN_IN_ONE_HOUR)
                        timeUnits = MediCareConstants.MODIFIER_0035_15_MINS_UPTO_1_HRS * timeSpan;
                    else
                        timeUnits = MediCareConstants.MODIFIER_0035_15_MINS_UPTO_1_HRS * 4 + MediCareConstants.MODIFIER_0035_AFTER_1_HRS_EACH_15_MINS * (timeSpan - 4);

                    if (anaestheticUnits != 0)
                    {
                        totalUnits = anaestheticUnits + timeUnits;
                    }
                    else
                        totalUnits = 0;

                    if (totalTime <= MediCareConstants.FIRST_HOUR_MINUTES)
                    {
                        modifierAmount = MediCareConstants.MODIFIER_0035_ANEASTHETIC_MIN_UNITS * modifierInput.UnitPrice;
                        modifierQuantity = MediCareConstants.MODIFIER_0035_ANEASTHETIC_MIN_UNITS;
                    }
                    else
                    {
                        var secondHourUnits = (totalUnits - anaestheticUnits) - (MediCareConstants.MODIFIER_0035_15_MINS_UPTO_1_HRS * MediCareConstants.FIFTEEN_MINUTES_SPAN_IN_ONE_HOUR);
                        var firstHourUnits = MediCareConstants.MODIFIER_0035_ANEASTHETIC_MIN_UNITS;
                        decimal modifierAmountValue = (secondHourUnits * modifierInput.UnitPrice) + (firstHourUnits * modifierInput.UnitPrice);
                        modifierAmount = modifierAmountValue;
                        modifierQuantity = secondHourUnits + firstHourUnits;
                    }
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = modifierQuantity };
        }

        public static async Task<ModifierOutput> CalculateModifier6100(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };

            if (modifierInput != null && modifierInput.ModifierCode == "6100" && modifierInput.PublicationId == MediCareConstants.P01 && modifierInput.TariffAmount != 0)
            {
                return modifierOutput;
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier6101(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };

            if (modifierInput != null && modifierInput.ModifierCode == "6101" && modifierInput.PublicationId == MediCareConstants.P01 && modifierInput.TariffAmount != 0)
            {
                modifierAmount = (2 * modifierInput.TariffAmount / 3);

                if (modifierAmount < modifierInput.PreviousLinesTotalAmount)
                {
                    modifierAmount = Math.Round(modifierAmount - modifierInput.PreviousLinesTotalAmount, 2);
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier6102(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };

            if (modifierInput != null && modifierInput.ModifierCode == "6102" && modifierInput.PublicationId == MediCareConstants.P01 && modifierInput.TariffAmount != 0)
            {
                modifierAmount = -modifierInput.TariffAmount;

                if (modifierInput.PreviousLinesTotalAmount >= modifierInput.TariffAmount)
                {
                    modifierAmount = Math.Round((modifierInput.TariffAmount + modifierAmount) * (-1), 2);
                }
                else
                {
                    if (modifierInput.TariffAmount < modifierAmount * (-1))
                    {
                        modifierAmount = 0.0M;
                    }
                    else
                    {
                        modifierAmount = Math.Round(((modifierInput.TariffAmount + modifierInput.TariffDiscount) - (modifierInput.TariffAmount + modifierAmount)) * (-1), 2);
                    }
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier8001(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal totalDentalTariffAmountInclusive = 0.0M;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
            int modifierCount = 0;

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_8001_CODE
                && modifierInput.PreviousInvoiceLines != null && modifierInput.PreviousInvoiceLines.Count > 0)
            {
                var lineToSearch = modifierInput.PreviousInvoiceLines.FindLast(x => x.HcpTariffCode == MediCareConstants.MODIFIER_8001_CODE);
                int lastModifierIndex = modifierInput.PreviousInvoiceLines.LastIndexOf(lineToSearch);
                var remainingItems = modifierInput.PreviousInvoiceLines.GetRange(lastModifierIndex + 1, modifierInput.PreviousInvoiceLines.Count - (lastModifierIndex + 1));

                if (remainingItems != null)
                {
                    foreach (var invoiceLine in remainingItems)
                    {
                        if (invoiceLine.TariffBaseUnitCostTypeId != null && invoiceLine.TariffBaseUnitCostTypeId == MediCareConstants.DENTAL)
                        {
                            totalDentalTariffAmountInclusive += invoiceLine.TotalTariffAmount;
                        }
                    }

                    if (totalDentalTariffAmountInclusive > 0 && modifierInput.PublicationId == MediCareConstants.Publication02
                        && modifierInput.PractitionerTypeId == MediCareConstants.MAXILLO_FACIAL_PRACTICE)
                    {
                        modifierAmount = Math.Round(totalDentalTariffAmountInclusive * MediCareConstants.MODIFIER_ONE_THIRD_PERCENT, 2);
                    }
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier8007(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal totalTariffAmountInclusive = 0.0M;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_8007_CODE
                && modifierInput.PreviousInvoiceLines != null && modifierInput.PreviousInvoiceLines.Count > 0)
            {
                var lineToSearch = new InvoiceLineDetails();
                int lastIndex = -1;
                int modifierCount = 0;
                int lineCountIndex = -1;

                foreach (var line in modifierInput.PreviousInvoiceLines)
                {
                    lineCountIndex++;
                    if (line.HcpTariffCode == MediCareConstants.MODIFIER_8007_CODE)
                    {
                        lineToSearch = line;
                        lastIndex = lineCountIndex;
                        modifierCount++;
                    }
                }

                var remaininginvoiceLines = new List<InvoiceLineDetails>();
                if (lastIndex != -1)
                {
                    for (int i = lastIndex + 1; i < modifierInput.PreviousInvoiceLines.Count; i++)
                    {
                        remaininginvoiceLines.Add(modifierInput.PreviousInvoiceLines[i]);
                        if (modifierInput.PreviousInvoiceLines[i].TariffBaseUnitCostTypeId != null && modifierInput.PreviousInvoiceLines[i].TariffBaseUnitCostTypeId == MediCareConstants.DENTAL)
                        {
                            totalTariffAmountInclusive += modifierInput.PreviousInvoiceLines[i].TotalTariffAmount;
                        }
                    }
                }
                else
                {
                    foreach (var line in modifierInput.PreviousInvoiceLines)
                    {
                        if (line.HcpTariffCode != MediCareConstants.MODIFIER_8007_CODE)
                        {
                            remaininginvoiceLines.Add(line);
                            totalTariffAmountInclusive += line.TotalTariffAmount;
                        }
                    }
                }

                if (remaininginvoiceLines != null && remaininginvoiceLines.Count > 0 && totalTariffAmountInclusive > 0
                    && modifierInput.PublicationId == MediCareConstants.Publication02 && modifierInput.PractitionerTypeId == MediCareConstants.DENTAL_PRACTICE)
                {
                    modifierAmount = Math.Round(totalTariffAmountInclusive * MediCareConstants.MODIFIER_FIFTEEN_PERCENT, 2);
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier8002(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal totalTariffAmountInclusive = 0.0M;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_8002_CODE
                && modifierInput.PreviousInvoiceLines != null && modifierInput.PreviousInvoiceLines.Count > 0)
            {
                var lineToSearch = new InvoiceLineDetails();
                int lastIndex = -1, lineCountIndex = -1;
                int modifierCount = 0;

                foreach (var line in modifierInput.PreviousInvoiceLines)
                {
                    lineCountIndex++;
                    if (line.HcpTariffCode == MediCareConstants.MODIFIER_8002_CODE)
                    {
                        lineToSearch = line;
                        lastIndex = lineCountIndex;
                        modifierCount++;
                    }
                }

                var remaininginvoiceLines = new List<InvoiceLineDetails>();
                if (lastIndex != -1)
                {
                    for (int i = lastIndex + 1; i < modifierInput.PreviousInvoiceLines.Count; i++)
                    {
                        remaininginvoiceLines.Add(modifierInput.PreviousInvoiceLines[i]);
                        if (modifierInput.PreviousInvoiceLines[i].TariffBaseUnitCostTypeId != null && modifierInput.PreviousInvoiceLines[i].TariffBaseUnitCostTypeId == MediCareConstants.DENTAL)
                        {
                            totalTariffAmountInclusive += modifierInput.PreviousInvoiceLines[i].TotalTariffAmount;
                        }
                    }
                }
                else
                {
                    foreach (var line in modifierInput.PreviousInvoiceLines)
                    {
                        if (line.HcpTariffCode != MediCareConstants.MODIFIER_8002_CODE)
                        {
                            remaininginvoiceLines.Add(line);
                            totalTariffAmountInclusive += line.TotalTariffAmount;
                        }
                    }
                }

                if (remaininginvoiceLines != null && remaininginvoiceLines.Count > 0 && totalTariffAmountInclusive > 0
                    && modifierInput.PublicationId == MediCareConstants.Publication02 && modifierInput.PractitionerTypeId == MediCareConstants.MAXILLO_FACIAL_PRACTICE)
                {
                    modifierAmount = Math.Round(totalTariffAmountInclusive * MediCareConstants.MODIFIER_FIFTY_PERCENT, 2);
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier8006(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal totalTariffAmountInclusive = 0.0M;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };


            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_8006_CODE
                && modifierInput.PreviousInvoiceLines != null && modifierInput.PreviousInvoiceLines.Count > 0)
            {
                var filteredTariffs = new List<InvoiceLineDetails>();
                filteredTariffs = modifierInput.PreviousInvoiceLines.OrderByDescending(i => i.TotalTariffAmount).Skip(2).ToList();
                List<int> modifierListIndices = modifierInput.PreviousInvoiceLines.Select((line, index) => line.HcpTariffCode == MediCareConstants.MODIFIER_8006_CODE ? index : -1).Where(index => index >= 0).ToList();

                int modifierCount = 0;
                foreach(int itemIndex in modifierListIndices)
                {
                    List<InvoiceLineDetails> groupedLines = new List<InvoiceLineDetails>();

                    for(int i = itemIndex - 1; i >= 0 && modifierInput.PreviousInvoiceLines[i].HcpTariffCode != MediCareConstants.MODIFIER_8006_CODE; i--)
                    {
                        if(!filteredTariffs.Contains(modifierInput.PreviousInvoiceLines[i]))
                        {
                            groupedLines.Add(modifierInput.PreviousInvoiceLines[i]);
                            totalTariffAmountInclusive += modifierInput.PreviousInvoiceLines[i].TotalTariffAmount;
                        }
                    }

                    decimal totalModifierLineAmount = -totalTariffAmountInclusive * MediCareConstants.MODIFIER_FIFTY_PERCENT;

                    if (modifierInput.PreviousInvoiceLines[itemIndex].HcpTariffCode == MediCareConstants.MODIFIER_8006_CODE)
                    {
                        modifierInput.PreviousInvoiceLines[itemIndex].TotalTariffAmount = totalModifierLineAmount;
                    }
                    modifierCount++;
                }

                decimal afterModifierLineAmount = 0.0M;
                var remaininginvoiceLines = new List<InvoiceLineDetails>();
                if (modifierCount >= 0)
                {
                    for (int i = modifierCount + 1; i < modifierInput.PreviousInvoiceLines.Count; i++)
                    {
                        remaininginvoiceLines.Add(modifierInput.PreviousInvoiceLines[i]);
                        afterModifierLineAmount += modifierInput.PreviousInvoiceLines[i].TotalTariffAmount;
                    }

                    modifierAmount = -afterModifierLineAmount * MediCareConstants.MODIFIER_FIFTY_PERCENT;
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits, ModifiedInvoiceLines = modifierInput?.PreviousInvoiceLines };
        }

        public static async Task<ModifierOutput> CalculateModifier8009(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal modifierDefaultAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };


            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_8009_CODE && modifierInput.PreviousInvoiceLines != null)
            {
                int modifierCount = 0;
                int lineIndex = 0;
                List<int> modifierListIndices = new List<int>();
                foreach (var line in modifierInput.PreviousInvoiceLines)
                {
                    if(line.HcpTariffCode == MediCareConstants.MODIFIER_8009_CODE)
                    {
                        modifierListIndices.Add(lineIndex);
                        modifierCount++;
                    }
                    lineIndex++;
                }

                var filteredTariff = new InvoiceLineDetails();
                int filteredIndex = -1;
                if (modifierInput.PreviousInvoiceLines.Count > 1)
                {
                    filteredTariff = modifierInput.PreviousInvoiceLines.OrderByDescending(i => i.TotalTariffAmount).Skip(1).FirstOrDefault();
                    filteredIndex = modifierInput.PreviousInvoiceLines.IndexOf(filteredTariff);
                    if (filteredTariff != null)
                    {
                        modifierAmount = -filteredTariff.TotalTariffAmount * MediCareConstants.MODIFIER_TWENTY_FIVE_PERCENT;
                    }
                }

                if(filteredTariff != null)
                {
                    if (modifierCount == 0)
                    {
                        modifierAmount = -filteredTariff.TotalTariffAmount * MediCareConstants.MODIFIER_TWENTY_FIVE_PERCENT;
                    }
                    else
                    {
                        bool isAmountCalculated = false;
                        for (int i = 0; i < modifierInput.PreviousInvoiceLines.Count; i++)
                        {
                            if (i < filteredIndex && modifierInput.PreviousInvoiceLines[i].HcpTariffCode == MediCareConstants.MODIFIER_8009_CODE)
                            {
                                modifierInput.PreviousInvoiceLines[i].TotalTariffAmount = modifierDefaultAmount;
                            }
                            else if (i > filteredIndex && !isAmountCalculated && modifierInput.PreviousInvoiceLines[i].HcpTariffCode == MediCareConstants.MODIFIER_8009_CODE)
                            {
                                modifierAmount = -filteredTariff.TotalTariffAmount * MediCareConstants.MODIFIER_TWENTY_FIVE_PERCENT;
                                modifierInput.PreviousInvoiceLines[i].TotalTariffAmount = modifierAmount;
                                isAmountCalculated = true;
                            }
                            else if (modifierInput.PreviousInvoiceLines[i].HcpTariffCode == MediCareConstants.MODIFIER_8009_CODE)
                            {
                                modifierInput.PreviousInvoiceLines[i].TotalTariffAmount = modifierDefaultAmount;
                            }
                        }
                    }
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits, ModifiedInvoiceLines = modifierInput?.PreviousInvoiceLines };
        }

        public static async Task<ModifierOutput> CalculateModifier8005(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal modifierDefaultAmount = 0.0M;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_8005_CODE
                && modifierInput.PreviousInvoiceLines != null && modifierInput.PreviousInvoiceLines.Count > 0
                && modifierInput.PractitionerTypeId == MediCareConstants.MAXILLO_FACIAL_PRACTICE)
            {
                modifierAmount = modifierDefaultAmount;
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits, ModifiedInvoiceLines = modifierInput?.PreviousInvoiceLines };
        }

        public static async Task<ModifierOutput> CalculateModifier8010(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal totalTariffAmountInclusive = 0.0M;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_8010_CODE
                && modifierInput.PreviousInvoiceLines != null && modifierInput.PreviousInvoiceLines.Count > 0)
            {
                var lineToSearch = new InvoiceLineDetails();
                int lastIndex = -1;
                int modifierCount = 0;
                int lineCountIndex = -1;

                foreach (var line in modifierInput.PreviousInvoiceLines)
                {
                    lineCountIndex++;
                    if (line.HcpTariffCode == MediCareConstants.MODIFIER_8010_CODE)
                    {
                        lineToSearch = line;
                        lastIndex = lineCountIndex;
                        modifierCount++;
                    }
                }

                var remaininginvoiceLines = new List<InvoiceLineDetails>();
                if (lastIndex != -1)
                {
                    for (int i = lastIndex + 1; i < modifierInput.PreviousInvoiceLines.Count; i++)
                    {
                        remaininginvoiceLines.Add(modifierInput.PreviousInvoiceLines[i]);
                        if (modifierInput.PreviousInvoiceLines[i].TariffBaseUnitCostTypeId != null && modifierInput.PreviousInvoiceLines[i].TariffBaseUnitCostTypeId == MediCareConstants.DENTAL &&
                            modifierInput.ReductionCodes.Contains(modifierInput.PreviousInvoiceLines[i].HcpTariffCode))
                        {
                            totalTariffAmountInclusive += modifierInput.PreviousInvoiceLines[i].TotalTariffAmount;
                        }
                    }
                }
                else
                {
                    foreach (var line in modifierInput.PreviousInvoiceLines)
                    {
                        if (line.HcpTariffCode != MediCareConstants.MODIFIER_8010_CODE && modifierInput.ReductionCodes.Contains(line.HcpTariffCode))
                        {
                            remaininginvoiceLines.Add(line);
                            totalTariffAmountInclusive += line.TotalTariffAmount;
                        }
                    }
                }

                if (remaininginvoiceLines != null && remaininginvoiceLines.Count > 0 && totalTariffAmountInclusive > 0
                    && modifierInput.PublicationId == MediCareConstants.Publication02 && modifierInput.PractitionerTypeId == MediCareConstants.DENTAL_PRACTICE)
                {
                    modifierAmount = Math.Round(totalTariffAmountInclusive * MediCareConstants.MODIFIER_SEVENTY_FIVE_PERCENT, 2);
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> CalculateModifier8008(ModifierInput modifierInput)
        {
            decimal modifierAmount = 0.0M;
            decimal totalUnits = MediCareConstants.MODIFIER_DEFAULT_QUANTITY;
            decimal totalTariffAmountInclusive = 0.0M;
            var modifierOutput = new ModifierOutput() { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };

            if (modifierInput != null && modifierInput.ModifierCode == MediCareConstants.MODIFIER_8008_CODE
                && modifierInput.PreviousInvoiceLines != null && modifierInput.PreviousInvoiceLines.Count > 0)
            {
                var lineToSearch = new InvoiceLineDetails();
                int lastIndex = -1;
                int modifierCount = 0;
                int lineCountIndex = -1;

                foreach (var line in modifierInput.PreviousInvoiceLines)
                {
                    lineCountIndex++;
                    if (line.HcpTariffCode == MediCareConstants.MODIFIER_8008_CODE)
                    {
                        lineToSearch = line;
                        lastIndex = lineCountIndex;
                        modifierCount++;
                    }
                }

                var remaininginvoiceLines = new List<InvoiceLineDetails>();
                if (lastIndex != -1)
                {
                    for (int i = lastIndex + 1; i < modifierInput.PreviousInvoiceLines.Count; i++)
                    {
                        remaininginvoiceLines.Add(modifierInput.PreviousInvoiceLines[i]);
                        if (modifierInput.PreviousInvoiceLines[i].TariffBaseUnitCostTypeId != null && modifierInput.PreviousInvoiceLines[i].TariffBaseUnitCostTypeId == MediCareConstants.DENTAL)
                        {
                            totalTariffAmountInclusive += modifierInput.PreviousInvoiceLines[i].TotalTariffAmount;
                        }
                    }
                }
                else
                {
                    foreach (var line in modifierInput.PreviousInvoiceLines)
                    {
                        if (line.HcpTariffCode != MediCareConstants.MODIFIER_8008_CODE)
                        {
                            remaininginvoiceLines.Add(line);
                            totalTariffAmountInclusive += line.TotalTariffAmount;
                        }
                    }
                }

                if (remaininginvoiceLines != null && remaininginvoiceLines.Count > 0 && totalTariffAmountInclusive > 0 && modifierInput.PublicationId == MediCareConstants.Publication02 && 
                    (modifierInput.PractitionerTypeId == MediCareConstants.DENTAL_PRACTICE || modifierInput.PractitionerTypeId == MediCareConstants.MAXILLO_FACIAL_PRACTICE)) 
                {
                    modifierAmount = Math.Round(totalTariffAmountInclusive * MediCareConstants.MODIFIER_TWENTY_FIVE_PERCENT, 2);
                }
            }

            return new ModifierOutput { ModifierAmount = modifierAmount, ModifierQuantity = totalUnits };
        }

        public static async Task<ModifierOutput> DefaultCalculationModifier()
        {
            decimal modifierAmount = 0.00M;
            decimal modifierQuantity = 0.00M;
            return new ModifierOutput
            {
                ModifierAmount = modifierAmount,
                ModifierQuantity = modifierQuantity
            };
        }
    }
}
