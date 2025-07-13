using System;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Billing.Utils
{
    public static class ChartPrefixHelper
    {
        public static AbilityCollectionChartPrefixEnum? GetChartPrefix(string brokerName, TransactionTypeEnum transactionType, int? productClass)
        {
            if (string.IsNullOrWhiteSpace(brokerName))
                return null;

            brokerName = System.Text.RegularExpressions.Regex.Replace(brokerName, @"\s+", " ").Trim().ToUpperInvariant();

            if (brokerName.IndexOf("EVEREST NB", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                if (transactionType == TransactionTypeEnum.Invoice)
                    return AbilityCollectionChartPrefixEnum.EVERESTNBINVFUN;
                if (transactionType == TransactionTypeEnum.CreditNote)
                    return AbilityCollectionChartPrefixEnum.EVERESTNBCRNFUN;
            }

            if (brokerName.IndexOf("EVEREST", StringComparison.OrdinalIgnoreCase) >= 0 && transactionType == TransactionTypeEnum.Invoice)
            {
                return AbilityCollectionChartPrefixEnum.EVERESTINVFUN;
            }

            if (brokerName.IndexOf("SENA", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                //Confirm with Prathima or Mbali (there are 11 SENA's)
                switch (transactionType)
                {
                    case TransactionTypeEnum.Invoice:
                        return AbilityCollectionChartPrefixEnum.FSENAINVFUN;
                    case TransactionTypeEnum.CreditNote:
                        return AbilityCollectionChartPrefixEnum.FSENACRNFUN;
                    case TransactionTypeEnum.Payment:
                        return AbilityCollectionChartPrefixEnum.FSENACOLFUN;
                    case TransactionTypeEnum.Refund:
                        return AbilityCollectionChartPrefixEnum.FSENAREFFUN;
                }
            }

            if (brokerName.IndexOf("MATLA", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                switch (transactionType)
                {
                    case TransactionTypeEnum.Invoice:
                    case TransactionTypeEnum.CreditNote:
                        {
                            if (productClass.HasValue && productClass == (int)ProductClassEnum.ValuePlus)
                                return AbilityCollectionChartPrefixEnum.MVPPREM;
                            else
                                return AbilityCollectionChartPrefixEnum.MATLAINVFUN;
                        }
                    case TransactionTypeEnum.Payment:
                        {
                            if (productClass.HasValue && productClass == (int)ProductClassEnum.ValuePlus)
                                return AbilityCollectionChartPrefixEnum.MVPCOL;
                            else
                                return AbilityCollectionChartPrefixEnum.MATLACOLFUN;
                        }
                    case TransactionTypeEnum.Refund:
                        if (productClass.HasValue && productClass == (int)ProductClassEnum.ValuePlus)
                            return AbilityCollectionChartPrefixEnum.MVPREF;
                        else
                            return AbilityCollectionChartPrefixEnum.REFIND;
                    default:
                        return null;
                }
            }

            if (brokerName.IndexOf("B3", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                if (transactionType == TransactionTypeEnum.Invoice)
                    return AbilityCollectionChartPrefixEnum.B3INVFUN;
                if (transactionType == TransactionTypeEnum.Payment)
                    return AbilityCollectionChartPrefixEnum.B3COLFUN;
            }

            if (brokerName.IndexOf("BAROKA", StringComparison.OrdinalIgnoreCase) >= 0 && transactionType == TransactionTypeEnum.Invoice)
            {
                return AbilityCollectionChartPrefixEnum.BAROKAINVFUN;
            }

            if (brokerName.IndexOf("KULA", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                //Confirm with Mohammed or Mbali (there are 4 Kula's)
            }

            if (brokerName.IndexOf("GAVANNI", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                if (transactionType == TransactionTypeEnum.Invoice)
                    return AbilityCollectionChartPrefixEnum.GAVANNIINV4;
                return AbilityCollectionChartPrefixEnum.GAVANNICRN4;
            }

            if (brokerName.IndexOf("AGI-FS", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                if (transactionType == TransactionTypeEnum.Invoice)
                    return AbilityCollectionChartPrefixEnum.AGIFSINVFUN;
                if (transactionType == TransactionTypeEnum.CreditNote)
                    return AbilityCollectionChartPrefixEnum.AGIFSCOLFUN;
            }

            return null;
        }
    }
}


